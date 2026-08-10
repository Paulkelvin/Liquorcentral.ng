import { AbstractFileProviderService } from "@medusajs/framework/utils"
import { FileTypes, Logger } from "@medusajs/framework/types"
import { v2 as cloudinary, UploadApiResponse } from "cloudinary"
import { Readable, Writable } from "stream"

type Options = {
  cloud_name: string
  api_key: string
  api_secret: string
  folder?: string
}

type InjectedDependencies = {
  logger: Logger
}

class CloudinaryFileProviderService extends AbstractFileProviderService {
  static identifier = "cloudinary"

  protected logger_: Logger
  protected options_: Options

  constructor({ logger }: InjectedDependencies, options: Options) {
    super()
    this.logger_ = logger
    this.options_ = options

    cloudinary.config({
      cloud_name: options.cloud_name,
      api_key: options.api_key,
      api_secret: options.api_secret,
      secure: true,
    })
  }

  static validateOptions(options: Record<string, unknown>): void {
    if (!options.cloud_name) {
      throw new Error("Cloudinary cloud_name is required")
    }
    if (!options.api_key) {
      throw new Error("Cloudinary api_key is required")
    }
    if (!options.api_secret) {
      throw new Error("Cloudinary api_secret is required")
    }
  }

  async upload(
    file: FileTypes.ProviderUploadFileDTO
  ): Promise<FileTypes.ProviderFileResultDTO> {
    const dataUri = `data:${file.mimeType};base64,${file.content}`
    const folder = this.options_.folder || "liquorcentral"

    const result: UploadApiResponse = await cloudinary.uploader.upload(
      dataUri,
      {
        folder,
        resource_type: "auto",
        public_id: file.filename.replace(/\.[^/.]+$/, ""),
      }
    )

    return {
      url: result.secure_url,
      key: result.public_id,
    }
  }

  async delete(
    files:
      | FileTypes.ProviderDeleteFileDTO
      | FileTypes.ProviderDeleteFileDTO[]
  ): Promise<void> {
    const fileArray = Array.isArray(files) ? files : [files]
    for (const file of fileArray) {
      await cloudinary.uploader.destroy(file.fileKey).catch((err: Error) => {
        this.logger_.warn(
          `Cloudinary delete failed for ${file.fileKey}: ${err.message}`
        )
      })
    }
  }

  async getPresignedDownloadUrl(
    fileData: FileTypes.ProviderGetFileDTO
  ): Promise<string> {
    return cloudinary.url(fileData.fileKey, {
      secure: true,
      sign_url: true,
      type: "authenticated",
    })
  }

  async getDownloadStream(
    fileData: FileTypes.ProviderGetFileDTO
  ): Promise<Readable> {
    const url = cloudinary.url(fileData.fileKey, { secure: true })
    const res = await fetch(url)
    if (!res.ok || !res.body) {
      throw new Error(`Failed to fetch file stream for ${fileData.fileKey}`)
    }
    return Readable.fromWeb(res.body as any)
  }

  async getAsBuffer(
    fileData: FileTypes.ProviderGetFileDTO
  ): Promise<Buffer> {
    const url = cloudinary.url(fileData.fileKey, { secure: true })
    const res = await fetch(url)
    if (!res.ok) {
      throw new Error(`Failed to fetch file buffer for ${fileData.fileKey}`)
    }
    return Buffer.from(await res.arrayBuffer())
  }

  async getUploadStream(
    fileData: FileTypes.ProviderUploadStreamDTO
  ): Promise<{
    writeStream: Writable
    promise: Promise<FileTypes.ProviderFileResultDTO>
    url: string
    fileKey: string
  }> {
    const folder = this.options_.folder || "liquorcentral"
    const publicId = fileData.filename.replace(/\.[^/.]+$/, "")

    let resolvePromise: (value: FileTypes.ProviderFileResultDTO) => void
    let rejectPromise: (reason: Error) => void
    const promise = new Promise<FileTypes.ProviderFileResultDTO>(
      (resolve, reject) => {
        resolvePromise = resolve
        rejectPromise = reject
      }
    )

    const writeStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "auto", public_id: publicId },
      (error, result) => {
        if (error || !result) {
          rejectPromise(error || new Error("Upload failed"))
        } else {
          resolvePromise({ url: result.secure_url, key: result.public_id })
        }
      }
    )

    const expectedUrl = cloudinary.url(`${folder}/${publicId}`, {
      secure: true,
    })

    return {
      writeStream,
      promise,
      url: expectedUrl,
      fileKey: `${folder}/${publicId}`,
    }
  }
}

export default CloudinaryFileProviderService
