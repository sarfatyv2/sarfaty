'use client';

import { Button, Input, Label, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@nexus/ui';
import { Plus, Trash2 } from 'lucide-react';

interface GuaranteeType {
  id: string;
  name: string;
}

export interface GuaranteeItem {
  key: string;
  guaranteeTypeId: string;
  description: string;
  estimatedValue: string;
}

interface GuaranteeListProps {
  guarantees: GuaranteeItem[];
  guaranteeTypes: GuaranteeType[];
  onChange: (guarantees: GuaranteeItem[]) => void;
}

export function GuaranteeList({ guarantees, guaranteeTypes, onChange }: GuaranteeListProps) {
  function addGuarantee() {
    onChange([...guarantees, { key: crypto.randomUUID(), guaranteeTypeId: '', description: '', estimatedValue: '' }]);
  }

  function removeGuarantee(index: number) {
    onChange(guarantees.filter((_, i) => i !== index));
  }

  function updateGuarantee(index: number, field: keyof GuaranteeItem, value: string) {
    const updated = guarantees.map((g, i) =>
      i === index ? { ...g, [field]: value } : g,
    );
    onChange(updated);
  }

  return (
    <div className="space-y-4">
      {guarantees.map((guarantee, index) => (
        <div key={guarantee.key} className="rounded-lg border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Garantia {index + 1}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeGuarantee(index)}
            >
              <Trash2 size={14} />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={guarantee.guaranteeTypeId}
                onValueChange={(value) => updateGuarantee(index, 'guaranteeTypeId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {guaranteeTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input
                value={guarantee.description}
                onChange={(e) => updateGuarantee(index, 'description', e.target.value)}
                placeholder="Ex: Galpão industrial"
              />
            </div>

            <div className="space-y-2">
              <Label>Valor Estimado (R$)</Label>
              <Input
                type="number"
                value={guarantee.estimatedValue}
                onChange={(e) => updateGuarantee(index, 'estimatedValue', e.target.value)}
                placeholder="0,00"
              />
            </div>
          </div>
        </div>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={addGuarantee}>
        <Plus size={14} />
        Adicionar garantia
      </Button>
    </div>
  );
}
