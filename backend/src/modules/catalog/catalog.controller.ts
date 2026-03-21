import { Controller, Get } from '@nestjs/common';
import { ListProductsUseCase } from './application/use-cases/list-products.use-case';

@Controller('products')
export class CatalogController {
  constructor(private readonly listProductsUseCase: ListProductsUseCase) {}

  @Get()
  listProducts() {
    return this.listProductsUseCase.execute();
  }
}
