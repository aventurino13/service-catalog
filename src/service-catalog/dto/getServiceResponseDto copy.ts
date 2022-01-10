import GetVersionResponseDto from './getVersionResponseDto';

export default class GetServiceResponseDto {
  id: number;
  name: string;
  description: string;
  createdDate: Date;
  versions: GetVersionResponseDto[];
}
