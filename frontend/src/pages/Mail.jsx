import React, { useState, useEffect } from 'react'
import workspaceInvitationService from '../services/workspaceInvitationService'
import '../styles/Mail.css'

const Mail = () => {
  const [selectedMail, setSelectedMail] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('inbox')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [showCompose, setShowCompose] = useState(false)
  
  // Workspace invitations state
  const [workspaceInvitations, setWorkspaceInvitations] = useState([])
  const [loadingInvitations, setLoadingInvitations] = useState(false)
  const [invitationError, setInvitationError] = useState('')

  // Dynamic mail categories with real counts
  const getMailCategories = () => {
    // Chỉ đếm những invitation có status PENDING
    const pendingInvitationCount = workspaceInvitations.filter(invitation => 
      invitation.status === 'PENDING'
    ).length;
    
    return [
      { id: 'inbox', name: 'Hộp thư đến', icon: 'bi-inbox', count: 15 },
      { id: 'starred', name: 'Đã đánh dấu sao', icon: 'bi-star', count: 3 },
      { id: 'sent', name: 'Đã gửi', icon: 'bi-send', count: 8 },
      { id: 'invitations', name: 'Lời mời workspace', icon: 'bi-people-fill', count: pendingInvitationCount }
    ]
  }

  const mockMails = [
    {
      id: 1,
      sender: 'Nguyễn Văn A',
      email: 'nguyenvana@example.com',
      subject: 'Báo cáo tình hình dự án Q4/2024',
      preview: 'Xin chào, tôi gửi báo cáo tình hình thực hiện dự án trong quý 4 năm 2024. Dự án đã hoàn thành 85% các milestone đề ra...',
      content: `
        <p>Xin chào anh/chị,</p>
        <p>Tôi gửi báo cáo tình hình thực hiện dự án trong quý 4 năm 2024. Dự án đã hoàn thành 85% các milestone đề ra với những kết quả đáng ghi nhận:</p>
        <ul>
          <li>Hoàn thành module đăng nhập và xác thực người dùng</li>
          <li>Triển khai hệ thống quản lý task và note</li>
          <li>Tích hợp API Google OAuth</li>
          <li>Thiết kế giao diện responsive</li>
        </ul>
        <p>Một số khó khăn gặp phải:</p>
        <ul>
          <li>Vấn đề tích hợp với hệ thống legacy</li>
          <li>Thiếu nguồn nhân lực trong giai đoạn cuối</li>
        </ul>
        <p>Kế hoạch cho Q1/2025:</p>
        <ul>
          <li>Hoàn thiện các tính năng còn lại</li>
          <li>Thực hiện testing toàn diện</li>
          <li>Chuẩn bị cho việc deploy production</li>
        </ul>
        <p>Trân trọng,<br>Nguyễn Văn A</p>
      `,
      time: '2 giờ trước',
      isRead: false,
      isStarred: true,
      hasAttachment: true,
      priority: 'high',
      category: 'inbox'
    },
    {
      id: 2,
      sender: 'HR Department',
      email: 'hr@company.com',
      subject: 'Thông báo nghỉ lễ Tết Nguyên Đán 2025',
      preview: 'Kính gửi toàn thể CBNV, Công ty thông báo lịch nghỉ Tết Nguyên Đán 2025 như sau...',
      content: `
        <p>Kính gửi toàn thể CBNV,</p>
        <p>Công ty thông báo lịch nghỉ Tết Nguyên Đán 2025 như sau:</p>
        <ul>
          <li><strong>Ngày bắt đầu nghỉ:</strong> 27/01/2025 (28 tháng Chạp)</li>
          <li><strong>Ngày đi làm trở lại:</strong> 03/02/2025 (mùng 6 Tết)</li>
          <li><strong>Tổng số ngày nghỉ:</strong> 8 ngày</li>
        </ul>
        <p>Các phòng ban vui lòng:</p>
        <ul>
          <li>Hoàn thành công việc trước ngày 25/01/2025</li>
          <li>Bàn giao công việc cho người thay thế (nếu có)</li>
          <li>Tắt tất cả thiết bị điện trước khi về</li>
        </ul>
        <p>Chúc toàn thể CBNV năm mới an khang thịnh vượng!</p>
        <p>Ban Giám đốc</p>
      `,
      time: '5 giờ trước',
      isRead: true,
      isStarred: false,
      hasAttachment: false,
      priority: 'normal',
      category: 'inbox'
    },
    {
      id: 3,
      sender: 'Trần Thị B',
      email: 'tranthib@example.com',
      subject: 'Meeting notes - Họp team development',
      preview: 'Gửi anh chị, đây là note của buổi họp team development hôm nay...',
      content: `
        <p>Gửi anh chị,</p>
        <p>Đây là note của buổi họp team development hôm nay:</p>
        <h4>Agenda:</h4>
        <ol>
          <li>Review sprint hiện tại</li>
          <li>Thảo luận về các feature mới</li>
          <li>Planning cho sprint tiếp theo</li>
          <li>Giải quyết các blockers</li>
        </ol>
        <h4>Kết quả thảo luận:</h4>
        <ul>
          <li>Sprint hiện tại hoàn thành 90% tasks</li>
          <li>Cần thêm 2 ngày để hoàn thiện feature X</li>
          <li>Phân công tasks cho sprint mới</li>
        </ul>
        <h4>Action items:</h4>
        <ul>
          <li>Anh A: Hoàn thành module authentication - Deadline: 16/07</li>
          <li>Chị B: Review code và viết test cases - Deadline: 17/07</li>
          <li>Anh C: Update documentation - Deadline: 18/07</li>
        </ul>
        <p>Thanks,<br>Trần Thị B</p>
      `,
      time: '1 ngày trước',
      isRead: true,
      isStarred: true,
      hasAttachment: true,
      priority: 'normal',
      category: 'inbox'
    },
    {
      id: 4,
      sender: 'System Admin',
      email: 'admin@workify.com',
      subject: 'Bảo trì hệ thống định kỳ',
      preview: 'Thông báo bảo trì hệ thống vào cuối tuần này từ 22:00 đến 02:00...',
      content: `
        <p>Kính gửi người dùng Workify,</p>
        <p>Chúng tôi sẽ thực hiện bảo trì hệ thống định kỳ vào:</p>
        <ul>
          <li><strong>Thời gian:</strong> Thứ 7, 20/07/2025 từ 22:00 đến 02:00 (CN)</li>
          <li><strong>Ảnh hưởng:</strong> Tất cả dịch vụ sẽ tạm ngừng hoạt động</li>
          <li><strong>Mục đích:</strong> Nâng cấp server và cải thiện performance</li>
        </ul>
        <p>Những cải tiến sau bảo trì:</p>
        <ul>
          <li>Tăng tốc độ tải trang 30%</li>
          <li>Bổ sung tính năng backup tự động</li>
          <li>Cải thiện security</li>
          <li>Sửa các bugs đã báo cáo</li>
        </ul>
        <p>Chúng tôi xin lỗi vì sự bất tiện này.</p>
        <p>Team Workify</p>
      `,
      time: '2 ngày trước',
      isRead: false,
      isStarred: false,
      hasAttachment: false,
      priority: 'low',
      category: 'inbox'
    },
    {
      id: 5,
      sender: 'Marketing Team',
      email: 'marketing@company.com',
      subject: 'Newsletter tháng 7 - Những tính năng mới của Workify',
      preview: 'Chào bạn! Tháng 7 này chúng tôi đã ra mắt nhiều tính năng thú vị...',
      content: `
        <p>Chào bạn!</p>
        <p>Tháng 7 này chúng tôi đã ra mắt nhiều tính năng thú vị trong Workify:</p>
        <h4>🚀 Tính năng mới:</h4>
        <ul>
          <li><strong>Rich Text Editor:</strong> Soạn thảo note với định dạng đa dạng</li>
          <li><strong>File Management:</strong> Upload và quản lý file đính kèm</li>
          <li><strong>Export Note:</strong> Xuất note ra PDF/DOCX</li>
          <li><strong>Version History:</strong> Theo dõi lịch sử chỉnh sửa</li>
        </ul>
        <h4>📊 Thống kê sử dụng:</h4>
        <ul>
          <li>1,250+ người dùng mới tham gia</li>
          <li>15,000+ notes được tạo</li>
          <li>98% người dùng hài lòng</li>
        </ul>
        <h4>🎁 Ưu đãi đặc biệt:</h4>
        <p>Nâng cấp lên Premium với giá ưu đãi 50% trong tháng này!</p>
        <p>Cảm ơn bạn đã sử dụng Workify!</p>
      `,
      time: '3 ngày trước',
      isRead: true,
      isStarred: false,
      hasAttachment: false,
      priority: 'low',
      category: 'inbox'
    },
    // Workspace Invitations
    {
      id: 5,
      sender: 'Trần Minh Hoàng',
      email: 'hoang.tran@company.com',
      subject: 'Lời mời tham gia workspace "Dự án Website Bán hàng"',
      preview: 'Bạn được mời tham gia workspace "Dự án Website Bán hàng" với vai trò Developer...',
      content: `
        <div class="invitation-card">
          <h4>🎉 Lời mời tham gia workspace</h4>
          <div class="workspace-info">
            <h5><i class="bi bi-briefcase me-2"></i>Dự án Website Bán hàng</h5>
            <p><strong>Người mời:</strong> Trần Minh Hoàng (Project Manager)</p>
            <p><strong>Vai trò:</strong> Developer</p>
            <p><strong>Mô tả:</strong> Phát triển website thương mại điện tử cho công ty XYZ</p>
          </div>
          <div class="workspace-details">
            <h6>Thông tin workspace:</h6>
            <ul>
              <li><strong>Thành viên hiện tại:</strong> 8 người</li>
              <li><strong>Dự án đang thực hiện:</strong> 3 dự án</li>
              <li><strong>Thời gian dự kiến:</strong> 6 tháng</li>
              <li><strong>Công nghệ:</strong> React, Node.js, MongoDB</li>
            </ul>
          </div>
          <div class="invitation-actions mt-3">
            <button class="btn btn-success me-2">✅ Chấp nhận</button>
            <button class="btn btn-outline-danger">❌ Từ chối</button>
          </div>
        </div>
      `,
      time: '1 giờ trước',
      isRead: false,
      isStarred: false,
      hasAttachment: false,
      priority: 'high',
      category: 'invitations',
      invitationType: 'workspace'
    },
    {
      id: 6,
      sender: 'Nguyễn Thị Lan',
      email: 'lan.nguyen@startup.com',
      subject: 'Mời bạn gia nhập workspace "Marketing Team"',
      preview: 'Chúng tôi muốn mời bạn tham gia vào workspace Marketing Team với vai trò Content Creator...',
      content: `
        <div class="invitation-card">
          <h4>🚀 Lời mời tham gia workspace</h4>
          <div class="workspace-info">
            <h5><i class="bi bi-megaphone me-2"></i>Marketing Team</h5>
            <p><strong>Người mời:</strong> Nguyễn Thị Lan (Marketing Manager)</p>
            <p><strong>Vai trò:</strong> Content Creator</p>
            <p><strong>Mô tả:</strong> Tạo nội dung marketing cho các sản phẩm công ty</p>
          </div>
          <div class="workspace-details">
            <h6>Thông tin workspace:</h6>
            <ul>
              <li><strong>Thành viên hiện tại:</strong> 12 người</li>
              <li><strong>Chiến dịch đang chạy:</strong> 5 chiến dịch</li>
              <li><strong>Kỹ năng cần thiết:</strong> Copywriting, Design, SEO</li>
              <li><strong>Mức độ:</strong> Mid-level</li>
            </ul>
          </div>
          <div class="invitation-actions mt-3">
            <button class="btn btn-success me-2">✅ Chấp nhận</button>
            <button class="btn btn-outline-danger">❌ Từ chối</button>
          </div>
        </div>
      `,
      time: '3 giờ trước',
      isRead: false,
      isStarred: true,
      hasAttachment: false,
      priority: 'normal',
      category: 'invitations',
      invitationType: 'workspace'
    },
    {
      id: 7,
      sender: 'Lê Văn Đức',
      email: 'duc.le@techcorp.vn',
      subject: 'Lời mời: Workspace "AI Research Lab"',
      preview: 'Tham gia nghiên cứu AI và Machine Learning cùng đội ngũ chuyên gia...',
      content: `
        <div class="invitation-card">
          <h4>🧠 Lời mời tham gia workspace</h4>
          <div class="workspace-info">
            <h5><i class="bi bi-cpu me-2"></i>AI Research Lab</h5>
            <p><strong>Người mời:</strong> Lê Văn Đức (Research Lead)</p>
            <p><strong>Vai trò:</strong> AI Research Engineer</p>
            <p><strong>Mô tả:</strong> Nghiên cứu và phát triển các mô hình AI tiên tiến</p>
          </div>
          <div class="workspace-details">
            <h6>Thông tin workspace:</h6>
            <ul>
              <li><strong>Thành viên hiện tại:</strong> 6 nhà nghiên cứu</li>
              <li><strong>Dự án nghiên cứu:</strong> 4 dự án</li>
              <li><strong>Công nghệ:</strong> TensorFlow, PyTorch, Python</li>
              <li><strong>Yêu cầu:</strong> PhD hoặc kinh nghiệm 3+ năm</li>
            </ul>
          </div>
          <div class="invitation-actions mt-3">
            <button class="btn btn-success me-2">✅ Chấp nhận</button>
            <button class="btn btn-outline-danger">❌ Từ chối</button>
          </div>
        </div>
      `,
      time: '1 ngày trước',
      isRead: true,
      isStarred: false,
      hasAttachment: true,
      priority: 'high',
      category: 'invitations',
      invitationType: 'workspace'
    },
    {
      id: 8,
      sender: 'Phạm Thị Mai',
      email: 'mai.pham@design.studio',
      subject: 'Mời tham gia "Creative Design Hub"',
      preview: 'Workspace dành cho các designer sáng tạo, làm việc với các dự án UI/UX hấp dẫn...',
      content: `
        <div class="invitation-card">
          <h4>🎨 Lời mời tham gia workspace</h4>
          <div class="workspace-info">
            <h5><i class="bi bi-palette me-2"></i>Creative Design Hub</h5>
            <p><strong>Người mời:</strong> Phạm Thị Mai (Design Director)</p>
            <p><strong>Vai trò:</strong> UI/UX Designer</p>
            <p><strong>Mô tả:</strong> Thiết kế giao diện và trải nghiệm người dùng cho các ứng dụng</p>
          </div>
          <div class="workspace-details">
            <h6>Thông tin workspace:</h6>
            <ul>
              <li><strong>Thành viên hiện tại:</strong> 15 designer</li>
              <li><strong>Dự án thiết kế:</strong> 8 dự án</li>
              <li><strong>Công cụ:</strong> Figma, Adobe XD, Sketch</li>
              <li><strong>Loại dự án:</strong> Mobile App, Web App, Branding</li>
            </ul>
          </div>
          <div class="invitation-actions mt-3">
            <button class="btn btn-success me-2">✅ Chấp nhận</button>
            <button class="btn btn-outline-danger">❌ Từ chối</button>
          </div>
        </div>
      `,
      time: '2 ngày trước',
      isRead: false,
      isStarred: false,
      hasAttachment: false,
      priority: 'normal',
      category: 'invitations',
      invitationType: 'workspace'
    }
  ]

  const [composeData, setComposeData] = useState({
    to: '',
    subject: '',
    content: ''
  })

  // Load workspace invitations on component mount
  useEffect(() => {
    if (selectedCategory === 'invitations') {
      loadWorkspaceInvitations()
    }
  }, [selectedCategory])

  // Also load on initial mount
  useEffect(() => {
    loadWorkspaceInvitations()
  }, [])

  const loadWorkspaceInvitations = async () => {
    try {
      setLoadingInvitations(true)
      setInvitationError('')
      
      console.log('Đang tải workspace invitations từ API...')
      
      // Enable API call để tải invitations thật
      const response = await workspaceInvitationService.getPendingInvitations()
      console.log('Response từ API:', response)
      
      // Xử lý response data
      let invitations = []
      if (response && response.data) {
        invitations = Array.isArray(response.data) ? response.data : []
      } else if (Array.isArray(response)) {
        invitations = response
      }
      
      console.log('Parsed invitations:', invitations)
      setWorkspaceInvitations(invitations)
      
    } catch (error) {
      console.error('Error loading workspace invitations:', error)
      setInvitationError(`Không thể tải lời mời workspace: ${error.message}`)
      // Fallback to empty array so UI doesn't break
      setWorkspaceInvitations([])
    } finally {
      setLoadingInvitations(false)
    }
  }

  const handleAcceptInvitation = async (invitationId) => {
    try {
      await workspaceInvitationService.acceptInvitation(invitationId)
      // Reload invitations after accepting
      await loadWorkspaceInvitations()
      // Clear selected mail to refresh view
      setSelectedMail(null)
      // Show success message
      alert('Đã chấp nhận lời mời workspace thành công!')
    } catch (error) {
      console.error('Error accepting invitation:', error)
      alert('Không thể chấp nhận lời mời. Vui lòng thử lại sau.')
    }
  }

  const handleDeclineInvitation = async (invitationId) => {
    try {
      await workspaceInvitationService.declineInvitation(invitationId)
      // Reload invitations after declining
      await loadWorkspaceInvitations()
      // Clear selected mail to refresh view
      setSelectedMail(null)
      // Show success message
      alert('Đã từ chối lời mời workspace.')
    } catch (error) {
      console.error('Error declining invitation:', error)
      alert('Không thể từ chối lời mời. Vui lòng thử lại sau.')
    }
  }

  // Combine regular emails with workspace invitations
  const getAllMails = () => {
    if (selectedCategory === 'invitations') {
      // Chỉ hiển thị workspace invitations từ API, không fallback về mockdata
      if (workspaceInvitations && workspaceInvitations.length > 0) {
        // Convert workspace invitations to mail format
        const invitationMails = workspaceInvitations.map((invitation, index) => {
          // Provide fallback values for missing data
          const safeInvitation = {
            id: invitation?.id || `temp_${index}`,
            workspaceName: invitation?.workspaceName || 'Unknown Workspace',
            workspaceDescription: invitation?.workspaceDescription || 'Không có mô tả',
            role: invitation?.role || 'MEMBER',
            inviterName: invitation?.inviterName || 'Unknown User',
            inviterEmail: invitation?.inviterEmail || 'unknown@email.com',
            createdAt: invitation?.createdAt || new Date().toISOString(),
            status: invitation?.status || 'PENDING',
            ...invitation
          }
          
          // Chỉ hiển thị action buttons nếu status là PENDING
          const actionButtons = safeInvitation.status === 'PENDING' ? `
            <div class="invitation-actions mt-3">
              <button class="btn btn-success me-2" onclick="handleAcceptInvitation('${safeInvitation.id}')">✅ Chấp nhận</button>
              <button class="btn btn-outline-danger" onclick="handleDeclineInvitation('${safeInvitation.id}')">❌ Từ chối</button>
            </div>
          ` : `
            <div class="invitation-status mt-3">
              <span class="badge bg-secondary">Trạng thái: ${safeInvitation.status}</span>
            </div>
          `
          
          return {
            id: `invitation_${safeInvitation.id}`,
            sender: safeInvitation.inviterName,
            email: safeInvitation.inviterEmail,
            subject: `Lời mời tham gia workspace: ${safeInvitation.workspaceName}`,
            preview: `Bạn được mời tham gia workspace "${safeInvitation.workspaceName}" với vai trò ${safeInvitation.role}. ${safeInvitation.status === 'PENDING' ? 'Hãy chấp nhận để bắt đầu cộng tác!' : `Trạng thái: ${safeInvitation.status}`}`,
            content: `
              <div class="workspace-invitation-card">
                <h5>🏢 Lời mời tham gia Workspace</h5>
                <p><strong>Workspace:</strong> ${safeInvitation.workspaceName}</p>
                <p><strong>Mô tả:</strong> ${safeInvitation.workspaceDescription}</p>
                <p><strong>Vai trò:</strong> <span class="badge bg-primary">${safeInvitation.role}</span></p>
                <p><strong>Người mời:</strong> ${safeInvitation.inviterName}</p>
                <p><strong>Email người mời:</strong> ${safeInvitation.inviterEmail}</p>
                ${actionButtons}
              </div>
            `,
            time: new Date(safeInvitation.createdAt).toLocaleDateString('vi-VN'),
            isRead: safeInvitation.status !== 'PENDING', // Đánh dấu đã đọc nếu không còn pending
            isStarred: false,
            hasAttachment: false,
            priority: 'normal',
            category: 'invitations',
            invitationType: 'workspace',
            invitationData: safeInvitation
          }
        })
        return invitationMails
      } else {
        // Không có invitation nào, trả về mảng rỗng (không hiển thị mockdata)
        return []
      }
    }
    
    // Cho các category khác, trả về mockMails
    return mockMails
  }

  const filteredMails = getAllMails().filter(mail => {
    const matchesCategory = mail.category === selectedCategory
    const matchesSearch = !searchKeyword || 
      mail.subject.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      mail.sender.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      mail.preview.toLowerCase().includes(searchKeyword.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const formatTime = (timeString) => {
    return timeString
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-danger'
      case 'normal': return 'text-primary'
      case 'low': return 'text-success'
      default: return 'text-muted'
    }
  }

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return 'bi-exclamation-triangle-fill'
      case 'normal': return 'bi-info-circle-fill'
      case 'low': return 'bi-check-circle-fill'
      default: return 'bi-circle'
    }
  }

  const handleCompose = () => {
    setShowCompose(true)
    setSelectedMail(null)
  }

  const handleSendMail = () => {
    // Logic gửi mail sẽ được implement sau
    console.log('Sending mail:', composeData)
    alert('Mail đã được gửi!')
    setShowCompose(false)
    setComposeData({ to: '', subject: '', content: '' })
  }

  const handleMarkAsRead = (mailId) => {
    // Logic đánh dấu đã đọc
    console.log('Mark as read:', mailId)
  }

  const handleStarToggle = (mailId) => {
    // Logic toggle star
    console.log('Toggle star:', mailId)
  }

  const handleDelete = (mailId) => {
    if (window.confirm('Bạn có chắc muốn xóa email này?')) {
      console.log('Delete mail:', mailId)
    }
  }

  return (
    <div className="mail-container">
      {/* Sidebar */}
      <div className="mail-sidebar">
        <div className="mail-sidebar-header">
          <button 
            className="btn btn-primary w-100 mb-3"
            onClick={handleCompose}
          >
            <i className="bi bi-plus-lg me-2"></i>
            Soạn thư
          </button>
        </div>
        
        <div className="mail-categories">
          {getMailCategories().map(category => (
            <button
              key={category.id}
              className={`mail-category-item ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
              data-category={category.id}
            >
              <div className="d-flex align-items-center">
                <i className={`bi ${category.icon} me-3`}></i>
                <span className="flex-grow-1">{category.name}</span>
                {category.count > 0 && (
                  <span className="badge bg-secondary">{category.count}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="mail-main">
        {/* Toolbar */}
        <div className="mail-toolbar">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <h4 className="mb-0 me-4">
                {getMailCategories().find(cat => cat.id === selectedCategory)?.name}
              </h4>
              <div className="mail-search">
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Tìm kiếm email..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            <div className="mail-actions">
              <button className="btn btn-outline-secondary btn-sm me-2">
                <i className="bi bi-arrow-clockwise"></i>
              </button>
              <button className="btn btn-outline-secondary btn-sm me-2">
                <i className="bi bi-gear"></i>
              </button>
              <div className="dropdown">
                <button 
                  className="btn btn-outline-secondary btn-sm dropdown-toggle" 
                  data-bs-toggle="dropdown"
                >
                  <i className="bi bi-three-dots"></i>
                </button>
                <ul className="dropdown-menu">
                  <li><a className="dropdown-item" href="#"><i className="bi bi-check-all me-2"></i>Đánh dấu tất cả đã đọc</a></li>
                  <li><a className="dropdown-item" href="#"><i className="bi bi-star me-2"></i>Gắn sao tất cả</a></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><a className="dropdown-item text-danger" href="#"><i className="bi bi-trash me-2"></i>Xóa tất cả</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="mail-content">
          {!showCompose && !selectedMail && (
            <div className="row h-100">
              {/* Email List */}
              <div className="col-md-4 mail-list">
                {loadingInvitations && selectedCategory === 'invitations' ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Đang tải...</span>
                    </div>
                    <p className="text-muted mt-3">Đang tải lời mời workspace...</p>
                  </div>
                ) : invitationError && selectedCategory === 'invitations' ? (
                  <div className="text-center py-5">
                    <i className="bi bi-exclamation-triangle fs-1 text-warning"></i>
                    <p className="text-danger mt-3">{invitationError}</p>
                    <button 
                      className="btn btn-outline-primary btn-sm"
                      onClick={loadWorkspaceInvitations}
                    >
                      <i className="bi bi-arrow-clockwise me-1"></i>
                      Thử lại
                    </button>
                  </div>
                ) : filteredMails.length === 0 ? (
                  <div className="text-center py-5">
                    <i className={`bi ${selectedCategory === 'invitations' ? 'bi-people-fill' : 'bi-inbox'} fs-1 text-muted`}></i>
                    <p className="text-muted mt-3">
                      {selectedCategory === 'invitations' 
                        ? 'Không có lời mời workspace nào'
                        : 'Không có email nào'
                      }
                    </p>
                    {selectedCategory === 'invitations' && (
                      <small className="text-muted">
                        Khi có lời mời tham gia workspace mới, chúng sẽ xuất hiện ở đây.
                      </small>
                    )}
                  </div>
                ) : (
                  filteredMails.map(mail => (
                    <div 
                      key={mail.id}
                      className={`mail-item ${!mail.isRead ? 'unread' : ''} ${selectedMail?.id === mail.id ? 'selected' : ''} ${mail.invitationType ? 'invitation-mail' : ''}`}
                      onClick={() => setSelectedMail(mail)}
                      data-category={mail.category}
                    >
                      <div className="mail-item-header">
                        <div className="d-flex align-items-center">
                          <button 
                            className={`btn btn-sm btn-link p-0 me-2 ${mail.isStarred ? 'text-warning' : 'text-muted'}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleStarToggle(mail.id)
                            }}
                          >
                            <i className={`bi ${mail.isStarred ? 'bi-star-fill' : 'bi-star'}`}></i>
                          </button>
                          <span className="mail-sender">{mail.sender}</span>
                          {mail.invitationType === 'workspace' && (
                            <span className="badge bg-success ms-2">
                              <i className="bi bi-people me-1"></i>Lời mời
                            </span>
                          )}
                          <div className="ms-auto d-flex align-items-center">
                            {mail.hasAttachment && (
                              <i className="bi bi-paperclip text-muted me-1"></i>
                            )}
                            <i className={`bi ${getPriorityIcon(mail.priority)} ${getPriorityColor(mail.priority)} me-2`}></i>
                            <small className="text-muted">{mail.time}</small>
                          </div>
                        </div>
                      </div>
                      <div className="mail-subject">{mail.subject}</div>
                      <div className="mail-preview">{mail.preview}</div>
                    </div>
                  ))
                )}
              </div>

              {/* Email Detail Placeholder */}
              <div className="col-md-8 mail-detail">
                <div className="text-center py-5">
                  <i className="bi bi-envelope-open fs-1 text-muted"></i>
                  <p className="text-muted mt-3">Chọn một email để xem chi tiết</p>
                </div>
              </div>
            </div>
          )}

          {/* Email Detail */}
          {selectedMail && !showCompose && (
            <div className="mail-detail-view">
              <div className="mail-detail-header">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <button 
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setSelectedMail(null)}
                  >
                    <i className="bi bi-arrow-left me-1"></i>
                    Quay lại
                  </button>
                  <div className="mail-detail-actions">
                    <button 
                      className="btn btn-outline-secondary btn-sm me-2"
                      onClick={() => handleMarkAsRead(selectedMail.id)}
                    >
                      <i className="bi bi-envelope-open"></i>
                    </button>
                    <button 
                      className={`btn btn-sm me-2 ${selectedMail.isStarred ? 'btn-warning' : 'btn-outline-warning'}`}
                      onClick={() => handleStarToggle(selectedMail.id)}
                    >
                      <i className={`bi ${selectedMail.isStarred ? 'bi-star-fill' : 'bi-star'}`}></i>
                    </button>
                    <button className="btn btn-outline-primary btn-sm me-2">
                      <i className="bi bi-reply"></i>
                    </button>
                    <button className="btn btn-outline-primary btn-sm me-2">
                      <i className="bi bi-reply-all"></i>
                    </button>
                    <button className="btn btn-outline-primary btn-sm me-2">
                      <i className="bi bi-forward"></i>
                    </button>
                    <button 
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleDelete(selectedMail.id)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
                
                <h3 className="mail-detail-subject">{selectedMail.subject}</h3>
                
                <div className="mail-detail-meta">
                  <div className="d-flex align-items-center">
                    <div className="mail-sender-avatar me-3">
                      <i className="bi bi-person-circle fs-3"></i>
                    </div>
                    <div className="flex-grow-1">
                      <div className="fw-bold">{selectedMail.sender}</div>
                      <div className="text-muted small">{selectedMail.email}</div>
                    </div>
                    <div className="text-muted small">
                      <i className={`bi ${getPriorityIcon(selectedMail.priority)} ${getPriorityColor(selectedMail.priority)} me-1`}></i>
                      {selectedMail.time}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mail-detail-content">
                {selectedMail.invitationType === 'workspace' ? (
                  <div className="workspace-invitation-content">
                    <div dangerouslySetInnerHTML={{ __html: selectedMail.content }} />
                    
                    {/* Interactive buttons that work with React - chỉ hiện khi status = PENDING */}
                    {selectedMail.invitationData?.status === 'PENDING' ? (
                      <div className="workspace-invitation-actions mt-4 p-3 bg-light rounded">
                        <h6>Thao tác:</h6>
                        <div className="d-flex gap-2">
                          <button 
                            className="btn btn-success"
                            onClick={() => handleAcceptInvitation(selectedMail.invitationData?.id || selectedMail.id)}
                          >
                            <i className="bi bi-check-lg me-2"></i>
                            Chấp nhận lời mời
                          </button>
                          <button 
                            className="btn btn-outline-danger"
                            onClick={() => handleDeclineInvitation(selectedMail.invitationData?.id || selectedMail.id)}
                          >
                            <i className="bi bi-x-lg me-2"></i>
                            Từ chối
                          </button>
                          <button 
                            className="btn btn-outline-secondary"
                            onClick={() => alert('Tính năng xem thông tin workspace chi tiết sẽ được phát triển sau!')}
                          >
                            <i className="bi bi-info-circle me-2"></i>
                            Xem chi tiết
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="workspace-invitation-status mt-4 p-3 bg-secondary rounded">
                        <h6 className="text-white">Trạng thái lời mời:</h6>
                        <span className={`badge ${
                          selectedMail.invitationData?.status === 'ACCEPTED' ? 'bg-success' :
                          selectedMail.invitationData?.status === 'DECLINED' ? 'bg-danger' :
                          'bg-warning'
                        } fs-6`}>
                          {selectedMail.invitationData?.status === 'ACCEPTED' ? '✅ Đã chấp nhận' :
                           selectedMail.invitationData?.status === 'DECLINED' ? '❌ Đã từ chối' :
                           selectedMail.invitationData?.status === 'EXPIRED' ? '⏰ Đã hết hạn' :
                           `📋 ${selectedMail.invitationData?.status}`
                          }
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div dangerouslySetInnerHTML={{ __html: selectedMail.content }} />
                )}
              </div>
              
              {selectedMail.hasAttachment && (
                <div className="mail-attachments mt-4">
                  <h6><i className="bi bi-paperclip me-2"></i>File đính kèm</h6>
                  <div className="attachment-list">
                    <div className="attachment-item">
                      <i className="bi bi-file-earmark-pdf text-danger me-2"></i>
                      <span>Báo_cáo_dự_án_Q4.pdf</span>
                      <small className="text-muted ms-2">(2.5 MB)</small>
                      <button className="btn btn-sm btn-outline-primary ms-2">
                        <i className="bi bi-download"></i>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Compose Mail */}
          {showCompose && (
            <div className="mail-compose">
              <div className="mail-compose-header">
                <h4>Soạn thư mới</h4>
                <button 
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setShowCompose(false)}
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>
              
              <div className="mail-compose-form">
                <div className="mb-3">
                  <label className="form-label">Đến:</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Nhập email người nhận..."
                    value={composeData.to}
                    onChange={(e) => setComposeData({...composeData, to: e.target.value})}
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Tiêu đề:</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nhập tiêu đề email..."
                    value={composeData.subject}
                    onChange={(e) => setComposeData({...composeData, subject: e.target.value})}
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Nội dung:</label>
                  <textarea
                    className="form-control"
                    rows={12}
                    placeholder="Nhập nội dung email..."
                    value={composeData.content}
                    onChange={(e) => setComposeData({...composeData, content: e.target.value})}
                  />
                </div>
                
                <div className="mail-compose-actions">
                  <button 
                    className="btn btn-primary me-2"
                    onClick={handleSendMail}
                  >
                    <i className="bi bi-send me-1"></i>
                    Gửi
                  </button>
                  <button className="btn btn-outline-secondary me-2">
                    <i className="bi bi-save me-1"></i>
                    Lưu nháp
                  </button>
                  <button className="btn btn-outline-secondary">
                    <i className="bi bi-paperclip me-1"></i>
                    Đính kèm
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Mail
