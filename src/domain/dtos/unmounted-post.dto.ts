import { t } from "@caffeine/models";
import { BuildPostDTO } from "./build-post.dto";
import { EntityDTO } from "@caffeine/models/dtos";

export const UnmountedPostDTO = t.Composite([BuildPostDTO, EntityDTO], {
	description:
		"Data transfer object representing an unmounted post, combining build data with entity metadata.",
});

export type UnmountedPostDTO = t.Static<typeof UnmountedPostDTO>;
