import type { IPostUniquenessCheckerService } from "@/domain/types/services";
import { SlugUniquenessCheckerService } from "@caffeine/domain/services";
import type { IPostReader } from "@/domain/types/repositories";

export function makeSlugUniquenessCheckerService(
    repository: IPostReader,
): IPostUniquenessCheckerService {
    return new SlugUniquenessCheckerService(repository);
}
