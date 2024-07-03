import IErrorDto from '../../dto/IErrorDto';

export class Utils {
  static removeQuotesAndBackslashes(segment: string): string {
    let result = segment.replace(/['"]+/g, '');
    result = result.replace(/\\/g, '');
    return result;
  }

  static formatCamelCase(segment: string): string {
    let result = segment.replace(/([A-Z])/g, ' $1').trim();
    result = result.charAt(0).toUpperCase() + result.slice(1);
    return result;
  }

  //
  static formatFirstSegment(messageArray: string[]): string[] {
    let firstSegment = messageArray[0];
    firstSegment = this.removeQuotesAndBackslashes(firstSegment);
    firstSegment = this.formatCamelCase(firstSegment);
    messageArray[0] = firstSegment;
    return messageArray;
  }

  static formatCelebrateErrorMessage(message: string): string {
    const messageArray = message.split(' ');
    const formattedArray = this.formatFirstSegment(messageArray);
    const formattedMessage = formattedArray.join(' ');
    return formattedMessage;
  }

  static convertToErrorDTO(errorMessage: string): IErrorDto {
    const errorDto: IErrorDto = {
      message: errorMessage,
    };

    return errorDto;
  }
}
