import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delay: number): T {
	const [debounceVal, setDebounceVal] = useState<T>(value);

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebounceVal(value);
		}, delay);

		return () => clearTimeout(handler);
	}, [value, delay]);

	return debounceVal;
}
