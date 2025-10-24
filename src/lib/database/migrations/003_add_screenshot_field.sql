-- Add screenshot field to scraped_webpages table
ALTER TABLE scraped_webpages 
ADD COLUMN screenshot TEXT;

-- Add comment for documentation
COMMENT ON COLUMN scraped_webpages.screenshot IS 'Base64 encoded screenshot of the webpage for visual reference';
