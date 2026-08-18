import React from 'react';
import FormField from '../../../components/ui/FormField';
import LinkInsertionCard from '../../../components/campaign/content/LinkInsertionCard';
import ShortLinkDomainCard from '../../../components/campaign/content/ShortLinkDomainCard';
import { contentI18n } from '../../../components/campaign/content/contentTranslations';
import { useLanguage } from '../../../hooks/useLanguage';
import {
  BundleCreateFormErrors,
  BundleCreateFormValues,
} from '../../../types/bundle';
import { BundlesCopy } from '../translations';

interface BundleInfoSectionProps {
  copy: BundlesCopy;
  values: BundleCreateFormValues;
  errors: BundleCreateFormErrors;
  linkError: string;
  onTitleChange: (value: string) => void;
  onObjectiveChange: (value: string) => void;
  onPersonaChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onInsertLinkChange: (value: boolean) => void;
  onLinkChange: (value: string) => void;
  onShortLinkDomainChange: (value: string | null) => void;
}

const BundleInfoSection: React.FC<BundleInfoSectionProps> = ({
  copy,
  values,
  errors,
  linkError,
  onTitleChange,
  onObjectiveChange,
  onPersonaChange,
  onDescriptionChange,
  onInsertLinkChange,
  onLinkChange,
  onShortLinkDomainChange,
}) => {
  const { language } = useLanguage();
  const contentCopy =
    contentI18n[language as keyof typeof contentI18n] || contentI18n.en;

  return (
    <section className='rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6'>
      <div className='mb-6'>
        <h2 className='text-2xl font-bold text-gray-900'>
          {copy.createPage.sections.bundleInfo}
        </h2>
      </div>

      <div className='space-y-5'>
        <FormField
          id='bundle-title'
          label={copy.createPage.fields.title}
          type='text'
          value={values.title}
          onChange={onTitleChange}
          placeholder={copy.createPage.placeholders.title}
          required
          error={errors.title}
        />

        <FormField
          id='bundle-objective'
          label={copy.createPage.fields.objective}
          type='text'
          value={values.objective}
          onChange={onObjectiveChange}
          placeholder={copy.createPage.placeholders.objective}
          required
          error={errors.objective}
        />

        <FormField
          id='bundle-persona'
          label={copy.createPage.fields.persona}
          type='textarea'
          rows={11}
          value={values.targetAudiencePersona}
          onChange={onPersonaChange}
          placeholder={copy.createPage.placeholders.persona}
          required
          error={errors.targetAudiencePersona}
        />

        <div className='grid gap-5'>
          <LinkInsertionCard
            insertLink={values.insertLink}
            link={values.link}
            linkError={linkError || errors.link || ''}
            onInsertLinkChange={onInsertLinkChange}
            onLinkChange={onLinkChange}
            title={contentCopy.insertLink}
            onLabel={contentCopy.on}
            offLabel={contentCopy.off}
            enabledLabel={contentCopy.linkInsertionEnabled}
            disabledLabel={contentCopy.linkInsertionDisabled}
            linkLabel={contentCopy.campaignLink}
            linkPlaceholder={contentCopy.linkPlaceholder}
            linkValidation={contentCopy.linkValidation}
            charactersLabel={contentCopy.characters}
          />

          {values.insertLink && (
            <ShortLinkDomainCard
              value={values.shortLinkDomain}
              onChange={onShortLinkDomainChange}
              title={contentCopy.shortLinkDomain}
              placeholder={contentCopy.shortLinkDomainPlaceholder}
              onLabel={contentCopy.on}
              offLabel={contentCopy.off}
              enabledLabel={contentCopy.shortLinkDomainEnabled}
              disabledLabel={contentCopy.shortLinkDomainDisabled}
            />
          )}
        </div>

        <FormField
          id='bundle-description'
          label={copy.createPage.fields.description}
          type='textarea'
          rows={4}
          value={values.description}
          onChange={onDescriptionChange}
          placeholder={copy.createPage.placeholders.description}
          error={errors.description}
        />
      </div>
    </section>
  );
};

export default BundleInfoSection;
