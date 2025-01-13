import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
  ValidationError,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      throw new BadRequestException({
        message: this.formatErrors(errors),
        error: 'Validation failed',
      });
    }

    return value;
  }

  private toValidate(metatype: abstract new (...args: any[]) => any): boolean {
    const types: (abstract new (...args: any[]) => any)[] = [
      String,
      Boolean,
      Number,
      Array,
      Object,
    ];
    return !types.includes(metatype);
  }

  private formatErrors(errors: ValidationError[]): string[] {
    const messages = new Set<string>();

    const addErrorMessages = (error: ValidationError) => {
      if (error.constraints) {
        Object.values(error.constraints).forEach((message) => {
          // 将英文错误消息转换为中文
          const translatedMessage = this.translateErrorMessage(message);
          messages.add(translatedMessage);
        });
      }

      if (error.children && error.children.length > 0) {
        error.children.forEach((childError) => addErrorMessages(childError));
      }
    };

    errors.forEach((error) => addErrorMessages(error));
    return Array.from(messages);
  }

  private translateErrorMessage(message: string): string {
    // 添加常见验证错误的中文翻译
    const translations: Record<string, string> = {
      'should not be empty': '不能为空',
      'must be a string': '必须是字符串类型',
      'must be longer than': '长度必须大于',
      'must be shorter than': '长度必须小于',
      'must be a number': '必须是数字',
      'must be an email': '必须是有效的电子邮件地址',
      'must be a boolean': '必须是布尔值',
      'must be a date': '必须是日期格式',
      'must be unique': '必须是唯一的',
      'must be one of the following values': '必须是以下值之一',
    };

    // 遍历翻译映射，替换匹配的英文消息
    let translatedMessage = message;
    Object.entries(translations).forEach(([eng, chn]) => {
      translatedMessage = translatedMessage.replace(eng, chn);
    });

    return translatedMessage;
  }
}
