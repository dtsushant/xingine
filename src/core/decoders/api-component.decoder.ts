import { Decoder, object, string} from "decoders";
import {ApiMetaMap} from "../component";

export const apiComponentDecoder: Decoder<ApiMetaMap> = object({
    actionUrl: string
});