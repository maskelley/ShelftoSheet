import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface ApiKeyInputProps {
  provider: 'openai' | 'gemini';
  onKeySaved?: () => void;
}

const PROVIDER_CONFIG = {
  openai: {
    label: 'OpenAI API Key',
    placeholder: 'sk-...',
    storageKey: 'openai_api_key',
    info: (
      <>
        <p>
          Your API key is stored only in your browser's local storage and is not sent to any server except OpenAI.
        </p>
        <p>
          To get an OpenAI API key, visit{' '}
          <a
            href="https://platform.openai.com/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            OpenAI's API Keys page
          </a>
          .
        </p>
      </>
    ),
    validate: async (apiKey: string) => {
      if (!apiKey.startsWith('sk-')) {
        throw new Error('API key should start with "sk-"');
      }
      const response = await axios.get('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (response.status !== 200) throw new Error('Invalid OpenAI API key');
    },
  },
  gemini: {
    label: 'Gemini API Key',
    placeholder: 'AIza...',
    storageKey: 'gemini_api_key',
    info: (
      <>
        <p>
          Your Gemini API key is stored only in your browser's local storage and is not sent to any server except Gemini.
        </p>
        <p>
          To get a Gemini API key, visit{' '}
          <a
            href="https://makersuite.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Gemini's API Keys page
          </a>
          .
        </p>
      </>
    ),
    validate: async (apiKey: string) => {
      if (!apiKey.startsWith('AI')) {
        throw new Error('Gemini API key should start with "AI"');
      }
      // Optionally, add a real validation call here if Gemini supports it
    },
  },
};

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ provider, onKeySaved }) => {
  const config = PROVIDER_CONFIG[provider];
  const [apiKey, setApiKey] = useState<string>('');
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [validationMessage, setValidationMessage] = useState<string>('');
  const [validationStatus, setValidationStatus] = useState<'success' | 'error' | 'none'>('none');

  useEffect(() => {
    const savedKey = localStorage.getItem(config.storageKey) || '';
    setApiKey(savedKey);
    setValidationMessage('');
    setValidationStatus('none');
  }, [provider]);

  const verifyApiKey = async () => {
    if (!apiKey.trim()) {
      setValidationMessage('API key cannot be empty');
      setValidationStatus('error');
      return;
    }
    setIsValidating(true);
    setValidationMessage('Validating API key...');
    setValidationStatus('none');
    try {
      await config.validate(apiKey.trim());
      localStorage.setItem(config.storageKey, apiKey.trim());
      setValidationMessage('API key is valid!');
      setValidationStatus('success');
      setTimeout(() => {
        if (onKeySaved) onKeySaved();
      }, 1000);
    } catch (error: any) {
      setValidationMessage(error.message || 'Invalid API key. Please check and try again.');
      setValidationStatus('error');
    } finally {
      setIsValidating(false);
    }
  };

  const handleSaveApiKey = () => {
    verifyApiKey();
  };

  const handleClearApiKey = () => {
    localStorage.removeItem(config.storageKey);
    setApiKey('');
    setValidationMessage('API key removed');
    setValidationStatus('none');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveApiKey();
    }
  };

  return (
    <div className="api-key-form p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">{config.label} Required</h2>
      <div className="form-group mb-4">
        <label htmlFor="apiKey" className="mb-2 block font-medium">
          Enter your {config.label}:
        </label>
        <div className="relative">
          <input
            type={showApiKey ? "text" : "password"}
            id="apiKey"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={config.placeholder}
            className={`w-full rounded-md border px-3 py-2 pr-10 focus:outline-none ${
              validationStatus === 'error'
                ? 'border-red-500 focus:border-red-500'
                : validationStatus === 'success'
                ? 'border-green-500 focus:border-green-500'
                : 'focus:border-blue-500'
            }`}
            disabled={isValidating}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
            onClick={() => setShowApiKey(!showApiKey)}
          >
            {showApiKey ? "Hide" : "Show"}
          </button>
        </div>
        {validationMessage && (
          <p
            className={`mt-1 text-sm ${
              validationStatus === 'error'
                ? 'text-red-600'
                : validationStatus === 'success'
                ? 'text-green-600'
                : 'text-gray-500'
            }`}
          >
            {validationMessage}
          </p>
        )}
      </div>
      <div className="flex space-x-2">
        <button
          onClick={handleSaveApiKey}
          disabled={isValidating}
          className="rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:bg-blue-300"
        >
          {isValidating ? "Validating..." : "Save API Key"}
        </button>
        {apiKey && (
          <button
            onClick={handleClearApiKey}
            className="rounded bg-gray-200 px-4 py-2 font-medium text-gray-700 hover:bg-gray-300"
          >
            Clear
          </button>
        )}
      </div>
      <div className="mt-6 text-sm text-gray-600 space-y-2">{config.info}</div>
    </div>
  );
};

export default ApiKeyInput;