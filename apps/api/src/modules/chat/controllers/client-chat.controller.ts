import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { SendClientChatMessageUseCase } from '../use-cases/send-client-chat-message.use-case';
import {
  sendChatMessageSchema,
  type SendChatMessageDto,
} from '../dto/send-chat-message.dto';

@ApiTags('Chat')
@ApiBearerAuth()
@Controller('clients/:clientId/chat')
@UseGuards(RolesGuard)
export class ClientChatController {
  constructor(
    private readonly sendClientChatMessage: SendClientChatMessageUseCase,
  ) {}

  @Post()
  @Roles('sales_rep', 'sales_supervisor', 'sales_manager', 'sales_director', 'admin')
  async sendMessage(
    @Param('clientId') clientId: string,
    @Body(new ZodValidationPipe(sendChatMessageSchema)) dto: SendChatMessageDto,
  ) {
    const result = await this.sendClientChatMessage.execute(
      clientId,
      dto.message,
      dto.history,
    );
    return { data: result };
  }
}
