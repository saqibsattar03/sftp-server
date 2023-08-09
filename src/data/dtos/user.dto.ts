import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({ type: String, name: 'firstName' })
  firstName: string;

  @ApiProperty({ type: String, name: 'lastName' })
  lastName: string;

  @ApiProperty({ type: String, name: 'email' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ type: String, name: 'password' })
  @IsNotEmpty()
  password: string;

  @ApiProperty({ type: String, name: 'role' })
  @IsNotEmpty()
  role: string;

  @ApiProperty({ type: Number, name: 'phoneNumber' })
  phoneNumber: number;

  @ApiProperty({ type: [String], name: 'scopes' })
  scopes: [string];

  @ApiProperty({ type: String, name: 'aboutMe' })
  aboutMe: string;
}
