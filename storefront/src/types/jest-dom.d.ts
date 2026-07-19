// Pulls in @testing-library/jest-dom's global Jest matcher type
// augmentations (toBeInTheDocument, toHaveTextContent, etc.) so `tsc`
// recognizes them across test files, not only Jest's own runtime.
import "@testing-library/jest-dom"
