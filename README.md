LAZLAB ZIP Inspector
A basic ZIP file browser built into LAZLAB. Upload, browse, export.

What It Does

Upload ZIP files directly
Browse file structure by type
Preview file contents
Export file inventory as JSON
Ask Groq AI about ZIP contents (optional)

That's it.

Why You'd Use It
You have a ZIP file. You want to understand its contents without extracting it locally.
Open LAZLAB, go to ZIP Inspector, upload the file. You can now:

See what file types are in there
Look at code/JSON/text files
Export the file list
Ask AI what the project is about

No extraction. No clutter. Done in under 30 seconds.

Setup
Extract app-with-zip-inspector.zip and deploy to your LAZLAB server. That's all.
New ZIP tab appears in the Archive view. Works offline. Uses your existing Groq key if you want AI analysis.

How It Works

Tap ZIP tab (in Archive view)
Upload a ZIP file
Browse by file type
Click any file to preview
Export inventory or ask AI


The Tech

JSZip 3.10.1 (CDN-based)
~340 lines of JavaScript added
Zero dependencies
Zero breaking changes
Works in all modern browsers


Deployment
5 minutes. Extract the ZIP, copy files to your server, done.
See DEPLOYMENT_GUIDE.md for step-by-step.

That's All
ZIP Inspector is a straightforward tool. Upload a ZIP, explore it, move on.
Useful when you need quick insight into a project structure. That's the whole feature.
