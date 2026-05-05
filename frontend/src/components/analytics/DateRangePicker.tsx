import { useState } from "react";
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import type { DateRangeValue } from "@/pages/admin/AnalyticsPage";

export type DateRange = '7d' | '30d' | '90d' | '1y' | 'custom';

const PRESETS = [
  { label: '7D',  value: '7d'  },
  { label: '30D', value: '30d' },
  { label: '90D', value: '90d' },
  { label: '1Y',  value: '1y'  },
] as const;

interface DateRangePickerProps {
	value: DateRangeValue;
	onChange: (value: DateRangeValue) => void;
}

/* const RANGES: { label: string; value: DateRange; description: string }[] = [
  { label: '7D', value: '7d', description: 'Last 7 days' },
  { label: '30D', value: '30d', description: 'Last 30 days' },
  { label: '90D', value: '90d', description: 'Last 90 days' },
  { label: '1Y', value: '1y', description: 'Last year' },
]; */

export const DateRangePicker = ({ value, onChange }: DateRangePickerProps) => {
	const [showCustom, setShowCustom] = useState(value.preset === 'custom');

	function handlePreset(preset: DateRangeValue['preset']) {
		setShowCustom(false);
		onChange({ preset, from: null, to: null});
	}

	function handleCustomClick() {
		setShowCustom(true);
		onChange({ preset: 'custom', from: value.from, to: value.to});
	}

	function handleFromChange(date: Date | null) {
		onChange({ ...value, preset: 'custom', from: date });
	}

	function handleToChange(date: Date | null) {
		onChange({ ...value, preset: 'custom', to: date });
	}
	return (
		<div className="flex items-center gap-2 flex-wrap">
			<div className="flex items-center gap-1 bg-secondary border border-border rounded-lg p-1">
				{PRESETS.map(preset => {
					const isActive = value.preset === preset.value;
					return (
						<button
							key={preset.value}
							onClick={() => handlePreset(preset.value)}
							className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
								isActive
									? 'bg-card text-foreground border border-border shadow-sm'
									: 'text-muted-foreground hover:text-foreground'
							}`}>
							{preset.label}
						</button>
					);
				})}

				{/* custom button */}
				<button
          onClick={handleCustomClick}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            value.preset === 'custom'
              ? 'bg-card text-foreground border border-border shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}>
          Custom
        </button>
			</div>

			{/* date picker visible when custom selected */}
			{showCustom && (
				<div className="flex items-center gap-2">
					<div className="relative">
						<DatePicker selected={value.from}
              onChange={handleFromChange}
              selectsStart
              startDate={value.from}
              endDate={value.to}
              maxDate={value.to ?? new Date()}
              placeholderText="From"
              dateFormat="MMM d, yyyy"
              className="bg-input border border-border rounded-lg px-3 py-1.5 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring w-32 cursor-pointer"
            />
					</div>

					<span className="text-xs text-muted-foreground">→</span>

					<div className="relative">
            <DatePicker selected={value.to}
              onChange={handleToChange}
              selectsEnd
              startDate={value.from}
              endDate={value.to}
              minDate={value.from ?? undefined}
              maxDate={new Date()}
              placeholderText="To"
              dateFormat="MMM d, yyyy"
              className="bg-input border border-border rounded-lg px-3 py-1.5 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring w-32 cursor-pointer"
            />
          </div>
				</div>
			)}

		</div>
  );
}