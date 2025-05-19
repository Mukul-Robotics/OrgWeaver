import type { DisplayAttributeKey } from '@/types/org-chart';
import { ALL_DISPLAY_ATTRIBUTES } from '@/types/org-chart';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AttributeSelectorProps {
  selectedAttributes: DisplayAttributeKey[];
  onSelectionChange: (selected: DisplayAttributeKey[]) => void;
}

export function AttributeSelector({ selectedAttributes, onSelectionChange }: AttributeSelectorProps) {
  const handleCheckboxChange = (attributeKey: DisplayAttributeKey, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedAttributes, attributeKey]);
    } else {
      onSelectionChange(selectedAttributes.filter(attr => attr !== attributeKey));
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Display Attributes</Label>
      <ScrollArea className="h-48 rounded-md border p-2">
        <div className="space-y-2">
        {(Object.keys(ALL_DISPLAY_ATTRIBUTES) as DisplayAttributeKey[]).map(attrKey => (
          <div key={attrKey} className="flex items-center space-x-2">
            <Checkbox
              id={`attr-${attrKey}`}
              checked={selectedAttributes.includes(attrKey)}
              onCheckedChange={(checked) => handleCheckboxChange(attrKey, Boolean(checked))}
            />
            <Label htmlFor={`attr-${attrKey}`} className="text-sm font-normal cursor-pointer">
              {ALL_DISPLAY_ATTRIBUTES[attrKey]}
            </Label>
          </div>
        ))}
        </div>
      </ScrollArea>
    </div>
  );
}
