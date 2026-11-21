import { IGiftCardBrand } from '../../models';
import { requireAdmin } from '../../middleware/auth';
import { AppContext } from '../../types/context';
import * as brandService from '../../services/brand.service';
import { SUPPORTED_COUNTRIES } from '../../constants/countries';

export const brandResolvers = {
  Query: {
    giftCardBrands: (_: unknown, __: unknown, _ctx: AppContext) => {
      return brandService.listBrands();
    },
    giftCardBrand: (_: unknown, { slug }: { slug: string }, _ctx: AppContext) => {
      return brandService.getBrandBySlug(slug);
    },
    countries: () => SUPPORTED_COUNTRIES,
  },

  Mutation: {
    createGiftCardBrand: (
      _: unknown,
      { input }: { input: brandService.CreateBrandInput },
      ctx: AppContext
    ) => {
      requireAdmin(ctx);
      return brandService.createBrand(input);
    },
    updateGiftCardBrand: (
      _: unknown,
      { id, input }: { id: string; input: brandService.UpdateBrandInput },
      ctx: AppContext
    ) => {
      requireAdmin(ctx);
      return brandService.updateBrand(id, input);
    },
    setGiftCardBrandActive: (
      _: unknown,
      { id, isActive }: { id: string; isActive: boolean },
      ctx: AppContext
    ) => {
      requireAdmin(ctx);
      return brandService.setBrandActive(id, isActive);
    },
    disableGiftCardBrand: (_: unknown, { id }: { id: string }, ctx: AppContext) => {
      requireAdmin(ctx);
      return brandService.disableBrand(id);
    },
  },

  GiftCardBrand: {
    id: (parent: IGiftCardBrand) => parent._id.toString(),
  },
};
