import { t } from "@caffeine/models";
import { RepositoryProviderDTO } from "../factories/repositories/dtos";
import { UrlDTO } from "@caffeine/models/dtos/primitives";

export const PostTypeDependenciesDTO = t.Object({
    DATABASE_URL: t.Optional(t.String()),
    DATABASE_PROVIDER: t.Optional(RepositoryProviderDTO),
    POST_TYPE_BASE_URL: t.Optional(UrlDTO),
    POST_TAG_BASE_URL: t.Optional(UrlDTO),
});

export type PostTypeDependenciesDTO = t.Static<typeof PostTypeDependenciesDTO>;
