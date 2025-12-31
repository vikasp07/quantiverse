import React, { useRef } from "react";
import { X, Download, Award } from "lucide-react";
import html2pdf from "html2pdf.js";

const Certificate = ({
  isOpen,
  onClose,
  userName,
  internshipTitle,
  completionDate,
  companyName,
}) => {
  const certificateRef = useRef(null);

  const handleDownload = () => {
    const element = certificateRef.current;
    const opt = {
      margin: 0,
      filename: `${userName.replace(
        /\s+/g,
        "_"
      )}_Certificate_${internshipTitle.replace(/\s+/g, "_")}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "in", format: "letter", orientation: "landscape" },
    };

    html2pdf().set(opt).from(element).save();
  };

  if (!isOpen) return null;

  const formattedDate = new Date(completionDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Award className="w-6 h-6 text-yellow-500" />
            <h2 className="text-xl font-bold text-gray-800">
              Certificate of Completion
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Certificate Content */}
        <div className="p-6">
          <div
            ref={certificateRef}
            className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 border-8 border-double border-blue-900 rounded-lg p-12 aspect-[11/8.5]"
            style={{
              backgroundImage: `
                radial-gradient(circle at 10% 20%, rgba(59, 130, 246, 0.05) 0%, transparent 50%),
                radial-gradient(circle at 90% 80%, rgba(147, 51, 234, 0.05) 0%, transparent 50%)
              `,
            }}
          >
            {/* Decorative Corner Elements */}
            <div className="absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4 border-yellow-500 rounded-tl-lg"></div>
            <div className="absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4 border-yellow-500 rounded-tr-lg"></div>
            <div className="absolute bottom-4 left-4 w-16 h-16 border-b-4 border-l-4 border-yellow-500 rounded-bl-lg"></div>
            <div className="absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4 border-yellow-500 rounded-br-lg"></div>

            {/* Certificate Content */}
            <div className="text-center h-full flex flex-col justify-between">
              {/* Header Section */}
              <div>
                {/* Logo/Brand */}
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <Award className="w-12 h-12 text-white" />
                  </div>
                </div>

                <h1 className="text-lg font-semibold text-blue-800 tracking-widest uppercase mb-2">
                  Quantiverse
                </h1>

                <h2 className="text-4xl font-serif font-bold text-gray-800 mb-2">
                  Certificate of Completion
                </h2>

                <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full mb-6"></div>

                <p className="text-gray-600 text-lg">This is to certify that</p>
              </div>

              {/* Name Section */}
              <div className="my-4">
                <h3
                  className="text-5xl font-serif font-bold text-blue-900 mb-2"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {userName}
                </h3>
                <div className="w-64 h-0.5 bg-gray-400 mx-auto"></div>
              </div>

              {/* Description Section */}
              <div className="mb-6">
                <p className="text-gray-700 text-lg leading-relaxed max-w-2xl mx-auto">
                  has successfully completed all tasks and requirements of the
                </p>
                <h4 className="text-2xl font-bold text-purple-800 mt-3 mb-3">
                  {internshipTitle}
                </h4>
                <p className="text-gray-700 text-lg">
                  Virtual Internship Simulation
                  {companyName && (
                    <span className="block mt-1">
                      provided by{" "}
                      <span className="font-semibold text-blue-800">
                        {companyName}
                      </span>
                    </span>
                  )}
                </p>
              </div>

              {/* Footer Section */}
              <div className="flex justify-between items-end mt-auto pt-6">
                {/* Date */}
                <div className="text-left">
                  <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">
                    Date of Completion
                  </p>
                  <p className="text-lg font-semibold text-gray-800">
                    {formattedDate}
                  </p>
                </div>

                {/* Seal */}
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 border-4 border-yellow-500 rounded-full flex items-center justify-center bg-gradient-to-br from-yellow-50 to-yellow-100 shadow-inner">
                    <div className="text-center">
                      <Award className="w-8 h-8 text-yellow-600 mx-auto" />
                      <p className="text-xs font-bold text-yellow-700 mt-1">
                        VERIFIED
                      </p>
                    </div>
                  </div>
                </div>

                {/* Signature */}
                <div className="text-right">
                  <div className="w-40 h-0.5 bg-gray-400 mb-2"></div>
                  <p className="text-lg font-serif italic text-gray-700">
                    Authorized Signature
                  </p>
                  <p className="text-sm text-gray-500">Quantiverse Platform</p>
                </div>
              </div>

              {/* Certificate ID */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-400">
                  Certificate ID: QV-{Date.now().toString(36).toUpperCase()}-
                  {Math.random().toString(36).substring(2, 8).toUpperCase()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Certificate;
