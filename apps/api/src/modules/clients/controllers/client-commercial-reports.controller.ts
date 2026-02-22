import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query, UseGuards, HttpCode, HttpStatus, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CreateCommercialReportUseCase } from '../use-cases/create-commercial-report.use-case';
import { GetCommercialReportsUseCase } from '../use-cases/get-commercial-reports.use-case';
import { ParseCommercialReportUseCase } from '../use-cases/parse-commercial-report.use-case';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { createCommercialReportSchema, type CreateCommercialReportDto } from '@nexus/validators';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@ApiTags('Client Commercial Reports')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('clients/:clientId/commercial-reports')
export class ClientCommercialReportsController {
  constructor(
    private readonly createCommercialReportUseCase: CreateCommercialReportUseCase,
    private readonly getCommercialReportsUseCase: GetCommercialReportsUseCase,
    private readonly parseCommercialReportUseCase: ParseCommercialReportUseCase,
  ) {}

  @Post()
  @Roles('sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director', 'admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a commercial report for a client' })
  async create(
    @Param('clientId', ParseUUIDPipe) clientId: string,
    @CurrentUser('sub') userId: string,
    @Body(new ZodValidationPipe(createCommercialReportSchema)) dto: CreateCommercialReportDto,
  ) {
    const data = await this.createCommercialReportUseCase.execute(clientId, userId, dto);
    return { data };
  }

  @Get()
  @Roles('sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director', 'credit_analyst', 'admin')
  @ApiOperation({ summary: 'Get commercial reports for a client' })
  @ApiQuery({ name: 'latest', required: false, type: Boolean })
  async get(
    @Param('clientId', ParseUUIDPipe) clientId: string,
    @Query('latest') latest?: boolean,
  ) {
    const data = await this.getCommercialReportsUseCase.execute(clientId, String(latest) === 'true');
    return { data };
  }

  @Post('parse')
  @Roles('sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director', 'admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Parse an uploaded commercial report Excel file to extract data' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async parseExcel(
    @Param('clientId', ParseUUIDPipe) clientId: string,
    @UploadedFile() file: { buffer: Buffer; originalname: string; mimetype: string },
  ) {
    const data = await this.parseCommercialReportUseCase.execute({
      file: {
        buffer: file.buffer,
        originalName: file.originalname,
        mimetype: file.mimetype,
      }
    });
    return { data };
  }
}