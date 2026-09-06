"use client";

import { usePathname, useSearchParams, useRouter } from "next/navigation";
import SingleSelectDropdown, {
  SingleSelectOption,
} from "@/components/Dropdown";
import { Season } from "@prisma/client";

interface SeasonSwitcherProps {
  seasonVals: Season[];
  selectedYear: number;
  className?: string;
}

export function SeasonSwitcher({
  seasonVals,
  selectedYear,
  className = "",
}: SeasonSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const options: SingleSelectOption<number>[] = seasonVals.map((season) => ({
    label: season.title
      ? `${season.title} ${season.year}`
      : season.year.toString(),
    value: season.year,
  }));

  function handleSeasonChange(year: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("season", String(year));
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <SingleSelectDropdown
      options={options}
      value={selectedYear}
      onChange={handleSeasonChange}
      placeholder="Choose a season..."
      className={className}
    />
  );
}