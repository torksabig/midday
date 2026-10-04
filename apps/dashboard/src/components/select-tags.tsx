import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@midday/ui/dialog";
import { Input } from "@midday/ui/input";
import { Label } from "@midday/ui/label";
import MultipleSelector from "@midday/ui/multiple-selector";
import { SubmitButton } from "@midday/ui/submit-button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  createTagFromRust,
  deleteTagFromRust,
  tagsQueryOptions,
  updateTagFromRust,
} from "@/lib/rust-api/tags-client";
import { useTRPC } from "@/trpc/client";

type Option = {
  id?: string;
  value: string;
  label: string;
};

type Props = {
  tags?: Option[];
  onSelect?: (tag: Option) => void;
  onRemove?: (tag: Option) => void;
  onChange?: (tags: Option[]) => void;
};

export function SelectTags({ tags, onSelect, onRemove, onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<Option[]>(tags ?? []);
  const [editingTag, setEditingTag] = useState<Option | null>(null);

  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data } = useQuery(tagsQueryOptions(trpc.tags.get.queryKey()));

  const updateTagMutation = useMutation({
    mutationFn: updateTagFromRust,
    onSuccess: () => {
      setIsOpen(false);
      queryClient.invalidateQueries({
        queryKey: trpc.tags.get.queryKey(),
      });
    },
  });

  const deleteTagMutation = useMutation({
    mutationFn: deleteTagFromRust,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.tags.get.queryKey(),
      });
    },
  });

  const createTagMutation = useMutation({
    mutationFn: createTagFromRust,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trpc.tags.get.queryKey() });
    },
  });

  const transformedTags = data
    ?.map((tag) => ({
      value: tag.name,
      label: tag.name,
      id: tag.id,
    }))
    .filter((tag) => !selected.some((s) => s.id === tag.id));

  const commitCreatedTag = (data: { id: string; name: string }) => {
    const newTag = {
      id: data.id,
      label: data.name,
      value: data.name,
    };

    setSelected((prev) => {
      const withoutProvisional = prev.filter(
        (tag) => tag.value !== data.name || Boolean(tag.id),
      );
      if (withoutProvisional.some((tag) => tag.id === data.id)) {
        return withoutProvisional;
      }
      return [...withoutProvisional.filter((tag) => tag.value !== data.name), newTag];
    });
    onSelect?.(newTag);
  };

  const handleCreateTag = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || createTagMutation.isPending) return;

    createTagMutation.mutate(
      { name: trimmed },
      {
        onSuccess: (data) => {
          if (data?.id && data.name) {
            commitCreatedTag(data);
          }
        },
      },
    );
  };

  const handleDelete = () => {
    if (editingTag?.id) {
      deleteTagMutation.mutate({ id: editingTag.id });

      setSelected(selected.filter((tag) => tag.id !== editingTag.id));
      setIsOpen(false);
    }
  };

  const handleUpdate = () => {
    if (editingTag?.id) {
      updateTagMutation.mutate({
        id: editingTag.id,
        name: editingTag.label,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <div className="w-full">
        <MultipleSelector
          options={transformedTags ?? []}
          value={selected}
          placeholder="Select tags"
          creatable
          emptyIndicator={<p className="text-sm">No results found.</p>}
          inputProps={{
            onKeyDown: (event) => {
              if (event.key !== "Enter") return;
              const value = event.currentTarget.value.trim();
              if (!value) return;
              // Creatable dropdown item can miss Enter when the list was closed;
              // always persist a brand-new tag name from the input.
              const exists =
                selected.some(
                  (tag) => tag.value.toLowerCase() === value.toLowerCase(),
                ) ||
                data?.some(
                  (tag) => tag.name.toLowerCase() === value.toLowerCase(),
                );
              if (!exists) {
                event.preventDefault();
                handleCreateTag(value);
              }
            },
          }}
          renderOption={(option) => (
            <div className="flex items-center justify-between w-full group">
              <span>{option.label}</span>

              <button
                type="button"
                className="text-xs group-hover:opacity-50 opacity-0"
                onClick={(event) => {
                  event.stopPropagation();
                  setEditingTag(option);
                  setIsOpen(true);
                }}
              >
                Edit
              </button>
            </div>
          )}
          onCreate={(option) => {
            handleCreateTag(option.value);
          }}
          onChange={(options) => {
            setSelected(options);
            onChange?.(options);

            const newTag = options.find(
              (tag) => !selected.find((opt) => opt.value === tag.value),
            );

            if (newTag) {
              // Provisional creatable options have no id yet — onCreate persists them.
              if (newTag.id) {
                onSelect?.(newTag);
              }
              return;
            }

            if (options.length < selected.length) {
              const removedTag = selected.find(
                (tag) => !options.find((opt) => opt.value === tag.value),
              ) as Option & { id: string };

              if (removedTag) {
                onRemove?.(removedTag);
                setSelected(options);
              }
            }
          }}
        />
      </div>

      <DialogContent className="max-w-[455px]">
        <div className="p-4">
          <DialogHeader>
            <DialogTitle>Edit Tag</DialogTitle>
            <DialogDescription>
              Make changes to the tag here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 w-full flex flex-col mt-4">
            <Label>Name</Label>
            <Input
              value={editingTag?.label}
              onChange={(event) => {
                if (editingTag) {
                  setEditingTag({
                    id: editingTag.id,
                    label: event.target.value,
                    value: editingTag.value,
                  });
                }
              }}
            />
          </div>

          <DialogFooter className="mt-8 w-full">
            <div className="space-y-2 w-full flex flex-col">
              <SubmitButton
                isSubmitting={updateTagMutation.isPending}
                onClick={handleUpdate}
              >
                Save
              </SubmitButton>

              <SubmitButton
                isSubmitting={deleteTagMutation.isPending}
                variant="outline"
                onClick={handleDelete}
              >
                Delete
              </SubmitButton>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
