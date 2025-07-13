import React, { useEffect, useMemo, useRef } from 'react'
import ReactQuill, { Quill } from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import '../styles/RichTextEditor.css'
import { uploadImageToNote } from '../services/fileService'

// 1. Define Custom Blots for Table, TableRow, TableCell - TẠMTHỜI DISABLE
// const Block = Quill.import('blots/block')
// const Container = Quill.import('blots/container')
// const Parchment = Quill.import('parchment')

// // TableCell Blot: Represents a <td> element
// class TableCell extends Block {
//   static blotName = 'table-cell'
//   static tagName = 'td'
//   static defaultChild = 'block'
//   static allowedChildren = [Parchment.Leaf, Block]
// }

// // TableRow Blot: Represents a <tr> element
// class TableRow extends Container {
//   static blotName = 'table-row'
//   static tagName = 'tr'
//   static allowedChildren = [TableCell]
//   static defaultChild = 'table-cell'
// }

// // Table Blot: Represents a <table> element
// class Table extends Container {
//   static blotName = 'table'
//   static tagName = 'table'
//   static allowedChildren = [TableRow]
//   static defaultChild = 'table-row'
// }

// // Register the custom Blots with Quill
// Quill.register({
//   'formats/table-cell': TableCell,
//   'formats/table-row': TableRow,
//   'formats/table': Table,
// }, true)

const RichTextEditor = ({ value, onChange, placeholder = "Nhập nội dung...", height = "200px", noteId = null }) => {
  const quillRef = useRef(null)
  
  // Register modules
  useEffect(() => {
    // Add Vietnamese tooltips
    const addTooltips = () => {
      const toolbar = document.querySelector('.ql-toolbar')
      if (toolbar) {
        // Format tooltips
        const formatButtons = {
          '.ql-bold': 'In đậm (Ctrl+B)',
          '.ql-italic': 'In nghiêng (Ctrl+I)', 
          '.ql-underline': 'Gạch chân (Ctrl+U)',
          '.ql-strike': 'Gạch ngang',
          '.ql-color': 'Màu chữ',
          '.ql-background': 'Màu nền',
          '.ql-list[value="ordered"]': 'Danh sách có số',
          '.ql-list[value="bullet"]': 'Danh sách dấu chấm',
          '.ql-list[value="check"]': 'Danh sách checkbox',
          '.ql-indent[value="-1"]': 'Giảm thụt lề',
          '.ql-indent[value="+1"]': 'Tăng thụt lề',
          '.ql-link': 'Chèn liên kết (Ctrl+K)',
          '.ql-blockquote': 'Trích dẫn',
          '.ql-code-block': 'Khối mã',
          // '.ql-insertTable': 'Chèn bảng', // TẠMTHỜI DISABLE
          '.ql-clean': 'Xóa định dạng'
        }
        
        Object.entries(formatButtons).forEach(([selector, title]) => {
          const button = toolbar.querySelector(selector)
          if (button) {
            button.setAttribute('title', title)
          }
        })
        
        // Header picker
        const headerPicker = toolbar.querySelector('.ql-header .ql-picker-label')
        if (headerPicker) {
          headerPicker.setAttribute('title', 'Chọn kiểu tiêu đề')
        }
        
        // Align picker
        const alignPicker = toolbar.querySelector('.ql-align .ql-picker-label')
        if (alignPicker) {
          alignPicker.setAttribute('title', 'Căn chỉnh văn bản')
        }
      }
    }
    
    // Add tooltips after a short delay to ensure toolbar is rendered
    setTimeout(addTooltips, 100)
  }, [])

  // Image upload handler
  const handleImageUpload = async () => {
    if (!noteId) {
      alert('Cần lưu note trước khi thêm ảnh');
      return;
    }

    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      const quill = quillRef.current.getEditor();
      const range = quill.getSelection(true);

      // Show loading
      quill.insertEmbed(range.index, 'image', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iOCIgY3k9IjgiIHI9IjciIHN0cm9rZT0iIzk5OSIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+CjxyZWN0IHg9IjUiIHk9IjUiIHdpZHRoPSI2IiBoZWlnaHQ9IjYiIGZpbGw9IiM5OTkiLz4KPC9zdmc+');
      quill.setSelection(range.index + 1);

      try {
        const result = await uploadImageToNote(noteId, file);
        
        if (result.success) {
          // Replace loading with actual image
          quill.deleteText(range.index, 1);
          quill.insertEmbed(range.index, 'image', result.imageUrl);
          quill.setSelection(range.index + 1);
        }
      } catch (error) {
        // Remove loading image on error
        quill.deleteText(range.index, 1);
        alert('Lỗi upload ảnh: ' + error.message);
      }
    };
  };

  // Cấu hình toolbar với Custom Blots
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'align': [] }],
        ['link', 'image', 'blockquote', 'code-block'],
        // ['insertTable'], // TẠMTHỜI DISABLE TABLE
        ['clean']
      ],
      handlers: {
        'image': handleImageUpload,
        // TẠMTHỜI DISABLE TABLE HANDLER
        // 'insertTable': function() {
        //   const rows = prompt('Nhập số hàng (1-10):', '3')
        //   const cols = prompt('Nhập số cột (1-10):', '3')

        //   const numRows = parseInt(rows || '3')
        //   const numCols = parseInt(cols || '3')

        //   // Giới hạn kích thước hợp lý
        //   const validRows = Math.min(Math.max(numRows, 1), 10)
        //   const validCols = Math.min(Math.max(numCols, 1), 10)

        //   const range = this.quill.getSelection(true)
        //   if (!range) return

        //   let ops = []

        //   // Insert a newline with the 'table' format
        //   ops.push({ insert: '\n', attributes: { table: true } })

        //   for (let i = 0; i < validRows; i++) {
        //     // For each row, insert a newline with the 'table-row' format
        //     ops.push({ insert: '\n', attributes: { 'table-row': true } })
        //     for (let j = 0; j < validCols; j++) {
        //       // For each cell, insert content with the 'table-cell' format
        //       const cellContent = (i === 0) ? `Cột ${j + 1}` : ' '
        //       ops.push({ insert: cellContent, attributes: { 'table-cell': true } })
        //     }
        //   }
        //   // Add a final newline to break out of the table context
        //   ops.push({ insert: '\n' })

        //   const Delta = Quill.import('delta')
        //   const delta = new Delta(ops)
        //   this.quill.updateContents(delta, Quill.sources.USER)
        //   // Move the cursor to the first cell of the newly inserted table
        //   this.quill.setSelection(range.index + 2)
      }
    }
  }), [noteId])

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'list', 'bullet', 'check', 'indent',
    'align', 'link', 'image', 'blockquote', 'code-block'
    // 'table', 'table-row', 'table-cell' // TẠMTHỜI DISABLE TABLE FORMATS
  ]

  return (
    <div className="rich-text-editor">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        style={{
          height: height,
          marginBottom: '42px' // Để tránh overlap với các element khác
        }}
      />
    </div>
  )
}

export default RichTextEditor
