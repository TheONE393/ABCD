# Team Photos Directory (`public/images/people/`)

Upload member and PI photos directly into this directory, or manage them via Google Sheets / Google Drive.

## How Photo Resolution Works:

1. **Local Files**:
   - Place image files here (e.g. `ramanujam-srinivasan.jpg`, `srijita.jpg`, `neelratna.jpg`).
   - In your Google Sheet, set the `photo_url` column to either:
     - Just the filename: `ramanujam-srinivasan.jpg`
     - Or the relative path: `/images/people/ramanujam-srinivasan.jpg`

2. **Google Drive Links**:
   - Upload the photo to Google Drive.
   - Set link sharing to **"Anyone with the link can view"**.
   - Copy the link and paste it into the `photo_url` column in Google Sheets.
   - The site automatically converts standard Google Drive share URLs into direct web-viewable image streams.

3. **External Web URLs**:
   - Any public HTTPS image URL (from institutional directories, Cloudinary, Imgur, etc.) will render directly.

4. **Empty / No Photo**:
   - If `photo_url` is left empty in the Google Sheet, a clean circular monogram avatar with the member's initials will automatically be displayed.
