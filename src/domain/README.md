# Post Domain

This directory contains the core business logic for the Post domain, structured following Domain-Driven Design (DDD) principles.

## Structure

- **Entities (`/`)**: Objects with unique identity that encapsulate state and behavior.
- **Value Objects (`/value-objects`)**: Immutable objects defined by their attributes and validations.
- **Domain Services (`/services`)**: Operations that encapsulate specific business logic or orchestration.
- **DTOs (`/dtos`)**: Data Transfer Objects for input and output typing.
- **Types (`/types`)**: Shared interfaces and type definitions.

## Main Aggregate

### Post (`src/domain/post.ts`)

The `Post` entity is the aggregate root and represents a publication in the system.

**Main Properties:**
- `name`: Post title.
- `slug`: Unique and URL-friendly identifier.
- `description`: Post description or summary.
- `cover`: Cover image URL.
- `tags`: List of associated tags (UUIDs).
- `postTypeId`: Identifier of the post type.

**Behaviors (Methods):**
- `rename(value: string)`: Changes the title and automatically regenerates the slug.
- `updateDescription(value: string)`: Updates the description.
- `updateCover(value: string)`: Updates the cover image.
- `updateTags(values: string[])`: Updates the list of tags.

**Creation:**
Use the static `Post.make()` method to create new instances, ensuring that all validation rules defined in `BuildPostDTO` are met.

## Domain Services

Services located in `/services` encapsulate specific logic:

- **PostUniquenessChecker**: Verifies the uniqueness of a post in the system, usually by checking if the slug is already in use via an `IPostReader`.
- **UnpackPost**: Converts a `Post` domain entity back into a simple object (DTO), useful for persistence or API responses.

## Value Objects

Located in `/value-objects`, these define specific types with their own validation:

- **SlugVO**: Ensures the slug is in the correct format (url-friendly).

The domain also uses shared Value Objects (`@caffeine/models/value-objects`) such as `DefinedStringVO`, `UrlVO`, and `UuidArrayVO`.
