import { exportCSV, ExportData } from "@/lib/export";
import { Button } from "../ui/button";

interface ExportButtonProps {
	data: ExportData;
}

export const ExportButton = ({ data }: ExportButtonProps) => {
	function handleExport() {
		exportCSV(data);
	}
	return(
		<Button onClick={handleExport}>
			Export as CSV
		</Button>
	)
}