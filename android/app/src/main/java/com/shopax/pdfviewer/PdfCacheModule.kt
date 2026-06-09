package com.shopax.pdfviewer

import android.net.Uri
import android.provider.OpenableColumns
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.File
import java.io.FileOutputStream
import java.util.UUID

class PdfCacheModule(
  private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "PdfCacheModule"

  @ReactMethod
  fun copyToCache(uriString: String, promise: Promise) {
    try {
      val uri = Uri.parse(uriString)

      if (uri.scheme == "file") {
        promise.resolve(uri.path ?: uriString.removePrefix("file://"))
        return
      }

      if (uri.scheme != "content") {
        promise.resolve(uriString)
        return
      }

      val resolver = reactContext.contentResolver
      val displayName = getDisplayName(uri)
      val safeName = sanitizeFileName(displayName ?: "shared-${UUID.randomUUID()}.pdf")
      val fileName = if (safeName.endsWith(".pdf", ignoreCase = true)) {
        safeName
      } else {
        "$safeName.pdf"
      }

      val cacheDir = File(reactContext.cacheDir, "shared-pdfs").apply {
        if (!exists()) mkdirs()
      }

      val outputFile = uniqueFile(cacheDir, fileName)

      resolver.openInputStream(uri).use { input ->
        if (input == null) {
          promise.reject(
            "PDF_CACHE_INPUT_NULL",
            "Unable to open input stream for URI: $uriString"
          )
          return
        }

        FileOutputStream(outputFile).use { output ->
          input.copyTo(output)
        }
      }

      promise.resolve(outputFile.absolutePath)
    } catch (securityException: SecurityException) {
      promise.reject(
        "PDF_CACHE_PERMISSION_DENIED",
        "Android denied access to URI: $uriString",
        securityException
      )
    } catch (error: Exception) {
      promise.reject(
        "PDF_CACHE_COPY_FAILED",
        "Failed to copy PDF URI to cache: $uriString",
        error
      )
    }
  }

  private fun getDisplayName(uri: Uri): String? {
    return reactContext.contentResolver
      .query(uri, arrayOf(OpenableColumns.DISPLAY_NAME), null, null, null)
      ?.use { cursor ->
        val index = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
        if (index >= 0 && cursor.moveToFirst()) cursor.getString(index) else null
      }
  }

  private fun sanitizeFileName(name: String): String {
    return name
      .substringAfterLast('/')
      .substringAfterLast('\\')
      .replace(Regex("[^A-Za-z0-9._-]"), "_")
      .ifBlank { "shared-${UUID.randomUUID()}.pdf" }
  }

  private fun uniqueFile(dir: File, fileName: String): File {
    val baseName = fileName.substringBeforeLast('.', fileName)
    val extension = fileName.substringAfterLast('.', "pdf")
    var candidate = File(dir, fileName)
    var count = 1

    while (candidate.exists()) {
      candidate = File(dir, "$baseName-$count.$extension")
      count += 1
    }

    return candidate
  }
}
