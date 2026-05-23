import { Module } from '@nestjs/common';
import { AttackChainsController } from './attack-chains.controller';
import { AttackChainsService } from './attack-chains.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AttackChainsController],
  providers: [AttackChainsService],
})
export class AttackChainsModule {}
