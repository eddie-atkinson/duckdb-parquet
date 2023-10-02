import { Select, SelectOption } from "@/components/ui/select";
import { FunctionComponent } from "react";

export type FileType = "csv" | "parquet";

const fileTypes: Record<FileType, string> = {
  csv: "CSV",
  parquet: "Parquet",
};
export interface FileTypeSelectorProps {
  value: FileType;
  onChange: (v: FileType | null) => void;
}

const getDisplay = (v?: FileType | null) => {
  return v ? fileTypes?.[v] ?? "" : "";
};
export const FileTypeSelector: FunctionComponent<FileTypeSelectorProps> = ({
  value,
  onChange,
}) => {
  return (
    <Select<FileType>
      name="fileType"
      value={value}
      onChange={onChange}
      getSelectedOptionLabel={getDisplay}
    >
      {Object.keys(fileTypes).map((value) => (
        <SelectOption
          key={value}
          value={value}
          display={getDisplay(value as FileType)}
        />
      ))}
    </Select>
  );
};
