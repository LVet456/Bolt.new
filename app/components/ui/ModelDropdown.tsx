// app/components/chat/ModelDropdown.tsx
import React, { useState, useEffect, useRef } from 'react';
import { classNames } from '~/utils/classNames';
import { DEFAULT_PROVIDER, DEFAULT_MODEL, getOllamaModels, getOpenAILikeModels, staticModels } from '~/utils/constants';
import { debounce } from '~/utils/debounce';
import { Dialog, DialogClose, DialogRoot } from '../ui/Dialog';
import { DialogTitle } from '~/components/ui/Dialog';
import { DialogDescription } from '~/components/ui/Dialog';
import { PanelHeader } from '~/components/ui/PanelHeader';
import { IconButton } from '~/components/ui/IconButton';
import type { ModelInfo } from '~/utils/types';

interface ModelDropdownProps {
  model: string;
  setModel: (model: string) => void;
  provider: string;
  setProvider: (provider: string) => void;
}

export const ModelDropdown: React.FC<ModelDropdownProps> = ({ model, setModel, provider, setProvider }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredModels, setFilteredModels] = useState<ModelInfo[]>(staticModels); // Initialize with static models
  const [loadingModels, setLoadingModels] = useState(true); // Add loading state

  useEffect(() => {
    // Fetch Ollama and OpenAILike models when the component mounts
    const fetchModels = async () => {
      try {
        const ollamaModels = await getOllamaModels();
        const openAiLikeModels = await getOpenAILikeModels();
        // Combine models
        const allModels = [...ollamaModels, ...openAiLikeModels, ...staticModels];

        setFilteredModels(allModels); // Update filtered models with all fetched models
      } catch (error) {
        console.error('Error fetching models:', error);
        // Handle error, e.g., display an error message
      } finally {
        setLoadingModels(false); // Set loading to false after fetching, regardless of success/failure
      }
    };

    fetchModels();
  }, []);

  const handleOpen = () => {
    setIsOpen(true);
  };
  const handleClose = () => {
    setIsOpen(false);
  };

  const debouncedSearch = useRef(
    debounce((query) => {
      const filtered = filteredModels.filter((m) => {
        // Use filteredModels for searching
        const providerMatch = m.provider.toLowerCase().includes(query.toLowerCase());
        const modelMatch = m.label.toLowerCase().includes(query.toLowerCase());

        return providerMatch || modelMatch;
      });
      setFilteredModels(filtered);
    }, 300),
  ).current;

  useEffect(() => {
    debouncedSearch(searchQuery);
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchQuery]);

  const handleModelSelect = (selectedModel: string, selectedProvider: string) => {
    setModel(selectedModel);
    setProvider(selectedProvider);
    handleClose();
  };

  const groupedModels = filteredModels.reduce(
    (acc, model) => {
      acc[model.provider] = acc[model.provider] || [];
      acc[model.provider].push(model);
      return acc;
    },
    {} as Record<string, ModelInfo[]>,
  );

  return (
    <div className="relative">
      <IconButton icon="i-ph:caret-down" className="mr-2" onClick={handleOpen} />

      <DialogRoot open={isOpen} onOpenChange={setIsOpen}>
        <DialogClose asChild>
          <div className="fixed inset-0 z-max" />
        </DialogClose>
        <Dialog>
          <PanelHeader>Select Model</PanelHeader>
          <DialogTitle asChild>
            <div className="px-4 py-4 flex flex-col gap-1.5">
              <input
                type="text"
                placeholder="Search models..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
          </DialogTitle>
          <DialogDescription asChild>
            <div className="px-4 py-4 flex flex-col gap-2 max-h-[50vh] overflow-y-auto">
              {loadingModels ? ( // Display loading indicator while fetching models
                <div>Loading models...</div>
              ) : (
                <>
                  {Object.entries(groupedModels).map(([providerName, models]) => (
                    <div key={providerName}>
                      <h3 className="text-lg font-medium">{providerName}</h3>
                      <ul>
                        {models.map((m) => (
                          <li
                            key={m.name}
                            className={classNames('px-2 py-1 rounded-md cursor-pointer hover:bg-gray-100', {
                              'bg-gray-200': model === m.name && provider === m.provider,
                            })}
                            onClick={() => handleModelSelect(m.name, m.provider)}
                          >
                            {m.label}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  <button
                    className="text-blue-500 underline"
                    onClick={() => {
                      /* Handle add provider */
                    }}
                  >
                    Add New Models Provider...
                  </button>
                </>
              )}
            </div>
          </DialogDescription>
        </Dialog>
      </DialogRoot>
    </div>
  );
};
