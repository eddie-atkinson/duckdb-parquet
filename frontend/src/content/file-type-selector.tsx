import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FunctionComponent } from "react";

export type FileType = "csv" | "parquet";

const fileTypes: Record<FileType, string> = {
  csv: "CSV",
  parquet: "Parquet",
};
export interface FileTypeSelectorProps {
  value: FileType;
  onChange: (v: string) => void;
}

const getDisplay = (v?: FileType | null) => {
  return v ? fileTypes?.[v] ?? "" : "";
};
export const FileTypeSelector: FunctionComponent<FileTypeSelectorProps> = ({
  value,
  onChange,
}) => {
  return (
    <Select
      name="fileType"
      value={value}
      onValueChange={onChange}
      defaultValue="csv"
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {Object.keys(fileTypes).map((value) => (
            <SelectItem key={value} value={value}>
              {getDisplay(value as FileType)}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
