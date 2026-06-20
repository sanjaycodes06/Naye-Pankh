/**
 * Triggers a browser download from a Blob response.
 * Usage: downloadFile(blob, "volunteers_approved_2025.csv")
 */
export const downloadFile = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement("a");
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

/**
 * When an axios request uses responseType: "blob" but the server returns
 * a JSON error (e.g. 404 "no records found"), axios wraps that JSON as a
 * Blob instead of parsing it — so err.response.data is a Blob, and
 * err.response.data.message is undefined ("[object Blob]" if stringified).
 *
 * This reads the Blob back into text and parses the real backend message,
 * falling back to a generic message if parsing fails for any reason.
 *
 * Usage:
 *   try { ... } catch (err) {
 *     const msg = await extractBlobErrorMessage(err, "Export failed.");
 *     toast.error(msg);
 *   }
 */
export const extractBlobErrorMessage = async (err, fallback = "Something went wrong.") => {
  const data = err?.response?.data;
  if (data instanceof Blob) {
    try {
      const text = await data.text();
      const parsed = JSON.parse(text);
      return parsed?.message || fallback;
    } catch {
      return fallback;
    }
  }
  return err?.response?.data?.message || fallback;
};
