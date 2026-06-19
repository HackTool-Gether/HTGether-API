import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PlatformRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const SALT_ROUNDS = 12;

function generatePassword(): string {
  // 12 chars: letters + digits + special chars
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  const special = '!@#$%&*';
  let password = '';
  for (let i = 0; i < 10; i++) {
    password += chars[crypto.randomInt(chars.length)];
  }
  // Insert 2 special chars at random positions
  for (let i = 0; i < 2; i++) {
    const pos = crypto.randomInt(password.length + 1);
    password = password.slice(0, pos) + special[crypto.randomInt(special.length)] + password.slice(pos);
  }
  return password;
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('A user with this email already exists');
    }

    const plainPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: dto.role,
        password: hashedPassword,
        mustChangePassword: true,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        avatarStyle: true,
        avatarSeed: true,
        avatarOptions: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    // Return user + plain password so admin can share it
    return { ...user, generatedPassword: plainPassword };
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        platformPermissions: true,
        avatarStyle: true,
        avatarSeed: true,
        avatarOptions: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        platformPermissions: true,
        avatarStyle: true,
        avatarSeed: true,
        avatarOptions: true,
        lastLoginAt: true,
        createdAt: true,
        projectMembers: {
          select: {
            role: true,
            project: {
              select: {
                id: true,
                name: true,
                clientCompany: true,
                status: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    if (dto.email && dto.email !== user.email) {
      const existing = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (existing) {
        throw new ConflictException('Un utilisateur avec cet email existe déjà');
      }
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.firstName !== undefined && { firstName: dto.firstName }),
        ...(dto.lastName !== undefined && { lastName: dto.lastName }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.role !== undefined && { role: dto.role }),
        ...(dto.platformPermissions !== undefined && { platformPermissions: dto.platformPermissions }),
        ...(dto.avatarStyle !== undefined && { avatarStyle: dto.avatarStyle }),
        ...(dto.avatarSeed !== undefined && { avatarSeed: dto.avatarSeed }),
        ...(dto.avatarOptions !== undefined && { avatarOptions: dto.avatarOptions }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        platformPermissions: true,
        avatarStyle: true,
        avatarSeed: true,
        avatarOptions: true,
        createdAt: true,
      },
    });
  }

  async resetPassword(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    const plainPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);

    await this.prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
        mustChangePassword: true,
      },
    });

    return { generatedPassword: plainPassword };
  }

  async toggleActive(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    });
  }

  async remove(id: string, requesterId: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    // Safety guards: never delete yourself or the last super admin.
    if (id === requesterId) {
      throw new BadRequestException(
        'Vous ne pouvez pas supprimer votre propre compte',
      );
    }
    if (user.role === PlatformRole.SUPER_ADMIN) {
      const superAdmins = await this.prisma.user.count({
        where: { role: PlatformRole.SUPER_ADMIN },
      });
      if (superAdmins <= 1) {
        throw new BadRequestException(
          'Impossible de supprimer le dernier super administrateur',
        );
      }
    }

    try {
      await this.prisma.user.delete({ where: { id } });
    } catch (err: any) {
      // Foreign-key restriction: the user still owns content (findings,
      // notes, remarks, tasks, messages...). Guide the admin instead of 500.
      if (err?.code === 'P2003') {
        throw new ConflictException(
          "Cet utilisateur a produit du contenu (findings, notes, messages…). Désactivez-le, ou réassignez son contenu avant de le supprimer.",
        );
      }
      throw err;
    }

    return { message: 'Utilisateur supprimé' };
  }
}
