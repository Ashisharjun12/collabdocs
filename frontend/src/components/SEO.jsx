import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords, image, url, type = 'website' }) => {
  const siteName = 'CollabDocs';
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const siteUrl = 'https://www.thecollabdocs.tech';
  const defaultDescription = 'CollabDocs is a modern, real-time collaborative document editor for teams. Write, edit, and think together with instant sync.';
  const defaultKeywords = 'collaborative editor, real-time editing, document sharing, team collaboration, CollabDocs, live sync, document versioning';
  const defaultImage = `${siteUrl}/og-image.png`;

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{fullTitle}</title>
      <meta name='description' content={description || defaultDescription} />
      <meta name='keywords' content={keywords || defaultKeywords} />

      {/* Open Graph tags */}
      <meta property='og:title' content={fullTitle} />
      <meta property='og:description' content={description || defaultDescription} />
      <meta property='og:type' content={type} />
      <meta property='og:url' content={url ? `${siteUrl}${url}` : siteUrl} />
      <meta property='og:image' content={image || defaultImage} />

      {/* Twitter tags */}
      <meta name='twitter:card' content='summary_large_image' />
      <meta name='twitter:title' content={fullTitle} />
      <meta name='twitter:description' content={description || defaultDescription} />
      <meta name='twitter:image' content={image || defaultImage} />
    </Helmet>
  );
};

export default SEO;
