import { Product } from "./product";

export interface ProductSavedEventArg {
    item?: Product, sku?: string[], isDelete?: boolean, isCreate?: boolean
}