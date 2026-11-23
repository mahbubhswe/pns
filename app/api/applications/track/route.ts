import { json, parseBody, readBody, route } from "@/lib/server/http";
import { toTrackApplicationDto, trackApplication, trackApplicationSchema } from "@/features/membership";
import type { TrackApplicationResponse } from "@/types/api";

/** Public: application status by reference number + phone number. */
export const POST = route(async req => {
  const input = parseBody(trackApplicationSchema, await readBody(req));
  const body: TrackApplicationResponse = { application: toTrackApplicationDto(await trackApplication(input)) };
  return json(body);
});
