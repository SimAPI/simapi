# @simapi/openapi

## 0.0.10 - Initial Decoupled Release

This is the first standalone release of the OpenAPI utilities, migrated from the core SimAPI package and significantly enhanced.

- **Importer**: Completely rewritten engine with support for OpenAPI 3.0.x and 3.1.x
- **Importer**: New tag-based file grouping — endpoints are automatically organized into files based on their OpenAPI tags
- **Importer**: Robust `$ref` resolution for complex nested schemas
- **Importer**: Enhanced Zod codegen supporting `const`, `enum`, `nullable` type arrays, and numeric/string constraints (min/max/format)
- **Exporter**: Moved existing exporter logic to this package to maintain a clean dependency separation
- **Core**: Shared types for OpenAPI Specifications (OAS)
- **Testing**: Comprehensive test suite with 37+ tests validating real-world spec scenarios
