
import { WithWrapIn } from "./wrap-in-meta";

export interface ApiMetaMap extends WithWrapIn<{
    actionUrl:string;
    [key: string]: unknown;
}> {}