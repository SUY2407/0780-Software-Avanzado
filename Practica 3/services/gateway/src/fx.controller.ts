import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Query, 
  Inject, 
  OnModuleInit, 
  HttpException, 
  HttpStatus 
} from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

// Interface para el servicio gRPC de FX
interface FxService {
  GetExchangeRate(data: any): any;
  ConvertAmount(data: any): any;
}

@Controller('v1/fx')
export class FxController implements OnModuleInit {
  private fxService: FxService;

  constructor(
    @Inject('FX_PACKAGE') private clientFx: ClientGrpc,
  ) {}

  onModuleInit() {
    this.fxService = this.clientFx.getService<FxService>('FxService');
  }

  /**
   * GET /v1/fx/rate?base=USD&quote=GTQ
   * Obtener tasa de cambio entre dos monedas
   */
  @Get('rate')
  async getExchangeRate(
    @Query('base') base: string,
    @Query('quote') quote: string,
  ) {
    if (!base || !quote) {
      throw new HttpException(
        'Missing required parameters: base and quote',
        HttpStatus.BAD_REQUEST,
      );
    }

    console.log(`Gateway - Getting exchange rate: ${base} -> ${quote}`);

    try {
      return await lastValueFrom(
        this.fxService.GetExchangeRate({ base, quote }),
      );
    } catch (e) {
      console.error('Error in Gateway getExchangeRate:', e);
      throw new HttpException(
        e.details || 'Error getting exchange rate',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * POST /v1/fx/convert
   * Body: { "from": "USD", "to": "GTQ", "amount": 100 }
   * Convertir un monto de una moneda a otra
   */
  @Post('convert')
  async convertAmount(@Body() body: any) {
    console.log('Gateway - Convert request:', JSON.stringify(body, null, 2));

    if (!body.from || !body.to || !body.amount) {
      throw new HttpException(
        'Missing required fields: from, to, amount',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      return await lastValueFrom(
        this.fxService.ConvertAmount({
          from: body.from,
          to: body.to,
          amount: body.amount,
        }),
      );
    } catch (e) {
      console.error('Error in Gateway convertAmount:', e);
      throw new HttpException(
        e.details || 'Error converting amount',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
