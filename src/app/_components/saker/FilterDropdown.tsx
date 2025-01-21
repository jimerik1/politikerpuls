import { Listbox, ListboxButton, ListboxOption, ListboxOptions, Label } from "@headlessui/react";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/20/solid";

interface FilterOption {
  value: string | null;
  title: string;
  description?: string;
}

interface FilterDropdownProps {
  label: string;
  value: string | null;
  onChange: (newValue: string | null) => void;
  options: FilterOption[];
}

export function FilterDropdown({ label, value, onChange, options }: FilterDropdownProps) {
  // Ensure we always have some fallback so TS doesn't complain
  const selectedOption =
    options.find((opt) => opt.value === value) ??
    options[0] ??
    { value: null, title: "No Options", description: "" };

  return (
    <Listbox
      value={selectedOption}
      onChange={(option) => onChange(option.value)}
    >
      {/* 
        (A) We can keep the label only for screen readers 
            or remove it entirely if you prefer 
      */}
      <Label className="sr-only">{label}</Label>
      
      {/* (B) Use a small text "button" in the table header */}
      <div className="relative inline-block text-left">
        <ListboxButton
          className="
            inline-flex 
            items-center 
            text-xs 
            font-medium 
            uppercase 
            text-gray-500 
            hover:text-indigo-600
          "
        >
          <span>{label}</span>
          <ChevronDownIcon className="ml-1 h-4 w-4" aria-hidden="true" />
        </ListboxButton>

        <ListboxOptions
          className="
            absolute
            right-0
            z-10
            mt-2
            w-48
            origin-top-right 
            divide-y 
            divide-gray-200
            rounded-md
            bg-white
            shadow-lg
            ring-1
            ring-black/5
            focus:outline-none
          "
        >
          {options.map((option) => (
            <ListboxOption
              key={option.title}
              value={option}
              className="
                group 
                cursor-pointer
                select-none 
                p-3 
                text-sm 
                text-gray-700
                hover:bg-indigo-600 
                hover:text-white
              "
            >
              <div className="flex justify-between">
                <p className="font-normal group-data-[selected]:font-semibold">
                  {option.title}
                </p>
                {/* Check icon only on the selected item */}
                <span className="text-indigo-600 group-[&:not([data-selected])]:hidden group-hover:text-white">
                  <CheckIcon aria-hidden="true" className="h-4 w-4" />
                </span>
              </div>
              {option.description && (
                <p className="mt-1 text-xs text-gray-500 group-hover:text-indigo-200">
                  {option.description}
                </p>
              )}
            </ListboxOption>
          ))}
        </ListboxOptions>
      </div>
    </Listbox>
  );
}