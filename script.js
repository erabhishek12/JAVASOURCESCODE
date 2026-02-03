// ==========================================
// ENHANCED CONFIGURATION WITH HIERARCHY
// ==========================================

const CONFIG = {
    SHEET_ID: '1gt3LLr9i5Nu888DVSrHyGCZaqHL6uqnDI1X3sMS7Qhg',
    COURSES_SHEET: 'Courses',
    BRANCHES_SHEET: 'Branches',
    SEMESTERS_SHEET: 'Semesters',
    SUBJECTS_SHEET: 'Subjects',
    RESOURCES_SHEET: 'Resources',
    UNIVERSITIES_SHEET: 'Universities',
    
    API_URL: 'https://opensheet.elk.sh/',
    
    // Features
    ENABLE_VOICE_SEARCH: true,
    ENABLE_BREADCRUMBS: true,
    ENABLE_SEO_METADATA: true,
    
    // Analytics
    ENABLE_DOWNLOAD_TRACKING: true
};

// ==========================================
// STATE MANAGEMENT
// ==========================================

const AppState = {
    // Data from sheets
    courses: [],
    branches: [],
    semesters: [],
    subjects: [],
    resources: [],
    universities: [],
    
    // Navigation state
    selectedCourse: null,
    selectedBranch: null,
    selectedSemester: null,
    selectedSubject: null,
    
    // Current view
    currentView: 'course', // course, branch, semester, subject, resource
    
    // Filters
    currentResourceType: 'all',
    currentLanguage: 'all',
    
    // User data
    downloads: JSON.parse(localStorage.getItem('downloads')) || [],
    bookmarks: JSON.parse(localStorage.getItem('bookmarks')) || [],
    
    // Theme
    theme: localStorage.getItem('theme') || 'light',
    
    // Voice
    recognition: null,
    isListening: false,
    
    // Navigation history for breadcrumbs
    navigationHistory: []
};

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    console.log('%c🎓 JavaSourceCode - Educational Platform ', 'background: linear-gradient(135deg, #4F46E5, #FF9933); color: white; font-size: 18px; padding: 10px 20px; border-radius: 5px; font-weight: bold;');
    
    showEnhancedLoading();
    
    await Promise.all([
        initializeTheme(),
        initializeNavbar(),
        initializeVoiceSearch(),
        fetchAllData(),
        initializeEventListeners()
    ]);
    
    hideEnhancedLoading();
    
    // Show initial view (courses)
    showCourses();
}

// ==========================================
// LOADING SCREEN
// ==========================================

function showEnhancedLoading() {
    const loadingScreen = document.getElementById('loadingScreen');
    const percentage = document.getElementById('loadingPercentage');
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 100) progress = 100;
        percentage.textContent = Math.floor(progress) + '%';
        if (progress >= 100) clearInterval(interval);
    }, 150);
}

function hideEnhancedLoading() {
    const loadingScreen = document.getElementById('loadingScreen');
    const percentage = document.getElementById('loadingPercentage');
    percentage.textContent = '100%';
    setTimeout(() => loadingScreen.classList.add('hidden'), 500);
}

// ==========================================
// THEME MANAGEMENT
// ==========================================

function initializeTheme() {
    document.documentElement.setAttribute('data-theme', AppState.theme);
    updateThemeIcon();
}

function toggleTheme() {
    AppState.theme = AppState.theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', AppState.theme);
    localStorage.setItem('theme', AppState.theme);
    updateThemeIcon();
}

function updateThemeIcon() {
    const icon = document.querySelector('#themeToggle i');
    if (icon) {
        icon.className = AppState.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// ==========================================
// NAVBAR
// ==========================================

function initializeNavbar() {
    const navbar = document.getElementById('navbar');
    const mobileToggle = document.getElementById('mobileToggle');
    const navMenu = document.getElementById('navMenu');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    mobileToggle?.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        mobileToggle.classList.toggle('active');
    });
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            mobileToggle?.classList.remove('active');
        });
    });
}

// ==========================================
// VOICE SEARCH
// ==========================================

function initializeVoiceSearch() {
    if (!CONFIG.ENABLE_VOICE_SEARCH || !('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        document.querySelectorAll('.voice-search').forEach(btn => {
            if (btn) btn.style.display = 'none';
        });
        return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    AppState.recognition = new SpeechRecognition();
    AppState.recognition.continuous = false;
    AppState.recognition.lang = 'en-US';
    
    AppState.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        handleVoiceSearch(transcript);
        stopVoiceSearch();
    };
    
    AppState.recognition.onerror = () => stopVoiceSearch();
    AppState.recognition.onend = () => stopVoiceSearch();
}

function startVoiceSearch() {
    if (!AppState.recognition) return;
    AppState.isListening = true;
    AppState.recognition.start();
    document.querySelectorAll('.voice-search').forEach(btn => btn.classList.add('active'));
}

function stopVoiceSearch() {
    if (!AppState.recognition) return;
    AppState.isListening = false;
    AppState.recognition.stop();
    document.querySelectorAll('.voice-search').forEach(btn => btn.classList.remove('active'));
}

function handleVoiceSearch(query) {
    // Simple voice command handling
    if (query.includes('btech') || query.includes('b tech')) {
        const btechCourse = AppState.courses.find(c => c.CourseName.toLowerCase().includes('btech'));
        if (btechCourse) selectCourse(btechCourse.ID);
    } else if (query.includes('bca')) {
        const bcaCourse = AppState.courses.find(c => c.CourseName.toLowerCase().includes('bca'));
        if (bcaCourse) selectCourse(bcaCourse.ID);
    }
    // Add more voice commands as needed
}

// ==========================================
// EVENT LISTENERS
// ==========================================

function initializeEventListeners() {
    document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
    
    document.getElementById('voiceSearch')?.addEventListener('click', () => {
        AppState.isListening ? stopVoiceSearch() : startVoiceSearch();
    });
    
    // Resource type filters
    document.querySelectorAll('.resource-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.resource-filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            AppState.currentResourceType = btn.dataset.type;
            filterResources();
        });
    });
    
    // Language filter
    document.getElementById('languageFilter')?.addEventListener('change', (e) => {
        AppState.currentLanguage = e.target.value;
        filterResources();
    });
}

// ==========================================
// FETCH ALL DATA FROM GOOGLE SHEETS
// ==========================================

async function fetchAllData() {
    try {
        const baseUrl = `${CONFIG.API_URL}${CONFIG.SHEET_ID}`;
        
        const [courses, branches, semesters, subjects, resources, universities] = await Promise.all([
            fetch(`${baseUrl}/${CONFIG.COURSES_SHEET}`).then(r => r.json()),
            fetch(`${baseUrl}/${CONFIG.BRANCHES_SHEET}`).then(r => r.json()),
            fetch(`${baseUrl}/${CONFIG.SEMESTERS_SHEET}`).then(r => r.json()),
            fetch(`${baseUrl}/${CONFIG.SUBJECTS_SHEET}`).then(r => r.json()),
            fetch(`${baseUrl}/${CONFIG.RESOURCES_SHEET}`).then(r => r.json()),
            fetch(`${baseUrl}/${CONFIG.UNIVERSITIES_SHEET}`).then(r => r.json())
        ]);
        
        AppState.courses = courses;
        AppState.branches = branches;
        AppState.semesters = semesters;
        AppState.subjects = subjects;
        AppState.resources = resources;
        AppState.universities = universities;
        
        console.log('✅ All data loaded successfully');
        
    } catch (error) {
        console.error('❌ Error loading data:', error);
        showError('Unable to load data. Please check your Sheet ID and configuration.');
    }
}

function showError(message) {
    const coursesGrid = document.getElementById('coursesGrid');
    if (coursesGrid) {
        coursesGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 64px; color: #EF4444; margin-bottom: 20px;"></i>
                <h3 style="color: var(--text-primary); margin-bottom: 15px;">Error Loading Content</h3>
                <p style="color: var(--text-secondary); margin-bottom: 20px;">${message}</p>
                <button onclick="location.reload()" class="btn btn-primary">
                    <i class="fas fa-redo"></i> Reload Page
                </button>
            </div>
        `;
    }
}

// ==========================================
// NAVIGATION FUNCTIONS
// ==========================================

function showCourses() {
    hideAllSteps();
    document.getElementById('courseStep').style.display = 'block';
    AppState.currentView = 'course';
    updateBreadcrumb();
    renderCourses();
}

function selectCourse(courseId) {
    AppState.selectedCourse = AppState.courses.find(c => c.ID == courseId);
    hideAllSteps();
    document.getElementById('branchStep').style.display = 'block';
    AppState.currentView = 'branch';
    updateBreadcrumb();
    renderBranches();
    scrollToTop();
}

function selectBranch(branchId) {
    AppState.selectedBranch = AppState.branches.find(b => b.ID == branchId);
    hideAllSteps();
    document.getElementById('semesterStep').style.display = 'block';
    AppState.currentView = 'semester';
    updateBreadcrumb();
    renderSemesters();
    scrollToTop();
}

function selectSemester(semesterId) {
    AppState.selectedSemester = AppState.semesters.find(s => s.ID == semesterId);
    hideAllSteps();
    document.getElementById('subjectStep').style.display = 'block';
    AppState.currentView = 'subject';
    updateBreadcrumb();
    renderSubjects();
    scrollToTop();
}

function selectSubject(subjectId) {
    AppState.selectedSubject = AppState.subjects.find(s => s.ID == subjectId);
    hideAllSteps();
    document.getElementById('resourceStep').style.display = 'block';
    AppState.currentView = 'resource';
    AppState.currentResourceType = 'all';
    updateBreadcrumb();
    updatePageMeta();
    renderResources();
    scrollToTop();
}

function goBack(to) {
    switch(to) {
        case 'course':
            showCourses();
            break;
        case 'branch':
            selectCourse(AppState.selectedCourse.ID);
            break;
        case 'semester':
            selectBranch(AppState.selectedBranch.ID);
            break;
        case 'subject':
            selectSemester(AppState.selectedSemester.ID);
            break;
    }
}

function hideAllSteps() {
    document.getElementById('courseStep').style.display = 'none';
    document.getElementById('branchStep').style.display = 'none';
    document.getElementById('semesterStep').style.display = 'none';
    document.getElementById('subjectStep').style.display = 'none';
    document.getElementById('resourceStep').style.display = 'none';
}

function scrollToTop() {
    window.scrollTo({ top: document.getElementById('courses').offsetTop - 100, behavior: 'smooth' });
}

// ==========================================
// RENDER FUNCTIONS
// ==========================================

function renderCourses() {
    const grid = document.getElementById('coursesGrid');
    
    grid.innerHTML = AppState.courses.map(course => `
        <div class="course-item glass-morphism" onclick="selectCourse(${course.ID})">
            <div class="course-icon">
                <i class="${course.Icon || 'fas fa-graduation-cap'}"></i>
            </div>
            <h3>${course.CourseName}</h3>
            <p>${course.Description}</p>
        </div>
    `).join('');
}

function renderBranches() {
    const grid = document.getElementById('branchGrid');
    const titleEl = document.getElementById('selectedCourse');
    
    titleEl.textContent = `${AppState.selectedCourse.CourseName} - Select Branch`;
    
    const branches = AppState.branches.filter(b => b.CourseID == AppState.selectedCourse.ID);
    
    if (branches.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary);">No branches available yet.</p>';
        return;
    }
    
    grid.innerHTML = branches.map(branch => `
        <div class="branch-item glass-morphism" onclick="selectBranch(${branch.ID})">
            <h3>${branch.BranchName}</h3>
            <p>${branch.Description}</p>
            <span class="university-badge">${branch.University || 'All Universities'}</span>
        </div>
    `).join('');
}

function renderSemesters() {
    const grid = document.getElementById('semesterGrid');
    const titleEl = document.getElementById('selectedBranch');
    
    titleEl.textContent = `${AppState.selectedBranch.BranchName} - Select Semester`;
    
    const semesters = AppState.semesters.filter(s => s.BranchID == AppState.selectedBranch.ID);
    
    if (semesters.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary);">No semesters available yet.</p>';
        return;
    }
    
    grid.innerHTML = semesters.map(sem => `
        <div class="semester-item glass-morphism" onclick="selectSemester(${sem.ID})">
            <div class="semester-number">${sem.SemesterNumber}</div>
            <h4>${sem.SemesterName}</h4>
        </div>
    `).join('');
}

function renderSubjects() {
    const grid = document.getElementById('subjectGrid');
    const titleEl = document.getElementById('selectedSemester');
    
    titleEl.textContent = `Semester ${AppState.selectedSemester.SemesterNumber} - Select Subject`;
    
    const subjects = AppState.subjects.filter(s => s.SemesterID == AppState.selectedSemester.ID);
    
    if (subjects.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary);">No subjects available yet.</p>';
        return;
    }
    
    grid.innerHTML = subjects.map(subject => `
        <div class="subject-item glass-morphism" onclick="selectSubject(${subject.ID})">
            <div class="subject-header">
                <span class="subject-code">${subject.SubjectCode}</span>
                <span class="subject-credits">${subject.Credits} Credits</span>
            </div>
            <h3>${subject.SubjectName}</h3>
            <p>${subject.Description}</p>
        </div>
    `).join('');
}

function renderResources() {
    const grid = document.getElementById('resourcesGrid');
    const titleEl = document.getElementById('selectedSubject');
    
    titleEl.textContent = `${AppState.selectedSubject.SubjectName} - Resources`;
    
    filterResources();
}

function filterResources() {
    const grid = document.getElementById('resourcesGrid');
    
    let resources = AppState.resources.filter(r => r.SubjectID == AppState.selectedSubject.ID);
    
    // Filter by type
    if (AppState.currentResourceType !== 'all') {
        resources = resources.filter(r => r.ResourceType === AppState.currentResourceType);
    }
    
    // Filter by language
    if (AppState.currentLanguage !== 'all') {
        resources = resources.filter(r => r.Language === AppState.currentLanguage);
    }
    
    if (resources.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                <i class="fas fa-inbox" style="font-size: 64px; color: var(--text-muted); margin-bottom: 20px;"></i>
                <h3 style="color: var(--text-primary);">No resources found</h3>
                <p style="color: var(--text-secondary);">Try different filters or check back later.</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = resources.map(resource => createResourceCard(resource)).join('');
}

function createResourceCard(resource) {
    const badgeClass = resource.ResourceType.toLowerCase();
    const isDownloaded = AppState.downloads.includes(resource.ID);
    
    return `
        <article class="resource-card glass-morphism">
            <span class="resource-type-badge ${badgeClass}">${resource.ResourceType}</span>
            <h3>${resource.Title}</h3>
            <p>${resource.Description}</p>
            
            <div class="resource-meta">
                <span class="resource-meta-item">
                    <i class="fas fa-language"></i>
                    ${resource.Language || 'English'}
                </span>
                <span class="resource-meta-item">
                    <i class="fas fa-university"></i>
                    ${resource.University || 'All'}
                </span>
                <span class="resource-meta-item">
                    <i class="fas fa-calendar"></i>
                    ${resource.Year || '2024'}
                </span>
                <span class="resource-meta-item">
                    <i class="fas fa-download"></i>
                    ${resource.Downloads || '0'} downloads
                </span>
            </div>
            
            <div class="resource-actions">
                <a href="${resource.Link}" 
                   target="_blank" 
                   class="resource-download-btn"
                   onclick="trackDownload(${resource.ID}, '${resource.ResourceType}', '${resource.Title}')">
                    <i class="fas fa-${resource.ResourceType === 'Video' ? 'play' : 'download'}"></i>
                    ${resource.ResourceType === 'Video' ? 'Watch Now' : 'Download'}
                </a>
                <button class="course-btn btn-bookmark ${isDownloaded ? 'bookmarked' : ''}" 
                        onclick="toggleBookmark(${resource.ID})"
                        title="${isDownloaded ? 'Remove from saved' : 'Save for later'}">
                    <i class="fas fa-bookmark"></i>
                </button>
            </div>
        </article>
    `;
}

// ==========================================
// DOWNLOAD TRACKING
// ==========================================

function trackDownload(resourceId, type, title) {
    if (CONFIG.ENABLE_DOWNLOAD_TRACKING) {
        if (!AppState.downloads.includes(resourceId)) {
            AppState.downloads.push(resourceId);
            localStorage.setItem('downloads', JSON.stringify(AppState.downloads));
        }
        
        console.log(`📥 Downloaded: ${type} - ${title}`);
        
        // Update download count in UI
        setTimeout(() => {
            const resource = AppState.resources.find(r => r.ID == resourceId);
            if (resource) {
                resource.Downloads = (parseInt(resource.Downloads) || 0) + 1;
            }
        }, 100);
    }
}

function toggleBookmark(resourceId) {
    const index = AppState.downloads.indexOf(resourceId);
    
    if (index > -1) {
        AppState.downloads.splice(index, 1);
    } else {
        AppState.downloads.push(resourceId);
    }
    
    localStorage.setItem('downloads', JSON.stringify(AppState.downloads));
    
    // Re-render to update UI
    filterResources();
}

// ==========================================
// BREADCRUMB NAVIGATION
// ==========================================

function updateBreadcrumb() {
    if (!CONFIG.ENABLE_BREADCRUMBS) return;
    
    const breadcrumbNav = document.getElementById('breadcrumbNav');
    const breadcrumb = breadcrumbNav?.querySelector('.breadcrumb');
    
    if (!breadcrumb) return;
    
    let items = ['<div class="breadcrumb-item"><a href="#" onclick="showCourses(); return false;"><i class="fas fa-home"></i> Home</a></div>'];
    
    if (AppState.selectedCourse) {
        items.push(`<span class="breadcrumb-separator">›</span>`);
        items.push(`<div class="breadcrumb-item"><a href="#" onclick="selectCourse(${AppState.selectedCourse.ID}); return false;">${AppState.selectedCourse.CourseName}</a></div>`);
    }
    
    if (AppState.selectedBranch) {
        items.push(`<span class="breadcrumb-separator">›</span>`);
        items.push(`<div class="breadcrumb-item"><a href="#" onclick="selectBranch(${AppState.selectedBranch.ID}); return false;">${AppState.selectedBranch.BranchName}</a></div>`);
    }
    
    if (AppState.selectedSemester) {
        items.push(`<span class="breadcrumb-separator">›</span>`);
        items.push(`<div class="breadcrumb-item"><a href="#" onclick="selectSemester(${AppState.selectedSemester.ID}); return false;">Semester ${AppState.selectedSemester.SemesterNumber}</a></div>`);
    }
    
    if (AppState.selectedSubject) {
        items.push(`<span class="breadcrumb-separator">›</span>`);
        items.push(`<div class="breadcrumb-item">${AppState.selectedSubject.SubjectName}</div>`);
    }
    
    breadcrumb.innerHTML = items.join('');
    breadcrumbNav.style.display = items.length > 1 ? 'block' : 'none';
}

// ==========================================
// DYNAMIC SEO META UPDATES
// ==========================================

function updatePageMeta() {
    if (!CONFIG.ENABLE_SEO_METADATA) return;
    
    let title = 'Free BTech BCA Notes, PYQ & Study Material | JavaSourceCode';
    let description = 'Download free engineering notes, previous year questions, and study materials.';
    let keywords = 'btech notes, engineering notes, pyq, study material';
    
    if (AppState.selectedSubject) {
        const subjectName = AppState.selectedSubject.SubjectName;
        const branchName = AppState.selectedBranch.BranchName;
        const semNumber = AppState.selectedSemester.SemesterNumber;
        
        title = `${subjectName} Notes, PYQ & Videos | Sem ${semNumber} ${branchName}`;
        description = `Download ${subjectName} complete notes, previous year questions, solutions & video lectures. ${branchName} Semester ${semNumber}. Free PDF download.`;
        keywords = `${subjectName.toLowerCase()} notes, ${subjectName.toLowerCase()} pyq, ${branchName.toLowerCase()} notes, semester ${semNumber}, ${AppState.selectedSubject.MetaKeywords || ''}`;
    }
    
    document.title = title;
    updateMetaTag('name', 'description', description);
    updateMetaTag('name', 'keywords', keywords);
    updateMetaTag('property', 'og:title', title);
    updateMetaTag('property', 'og:description', description);
}

function updateMetaTag(attr, key, content) {
    let element = document.querySelector(`meta[${attr}="${key}"]`);
    if (element) {
        element.setAttribute('content', content);
    }
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

// ==========================================
// CONSOLE BRANDING
// ==========================================

console.log('%c📚 Hierarchical Navigation Ready! ', 'color: #10B981; font-size: 14px; font-weight: bold;');
console.log('%c6 Sheets: Courses → Branches → Semesters → Subjects → Resources', 'color: #64748B; font-size: 12px;');

console.log('%c🔍 SEO Optimized | 🎤 Voice Search | 📊 Download Tracking', 'color: #4F46E5; font-size: 11px;');

/* ═══════════════════════════════════════════════════════════════════════════
   SMART DEEP SHARING SYSTEM
   Generates dynamic share links with full navigation state
   
   Paste this at the END of your app.js
═══════════════════════════════════════════════════════════════════════════ */

(function() {
    'use strict';

    // ═══════════════════════════════════════════════════════════════════════
    // SHARE DATA STATE
    // ═══════════════════════════════════════════════════════════════════════
    
    var ShareData = {
        type: 'page',        // page, course, branch, semester, subject, resource
        id: null,
        title: '',
        description: '',
        image: '',
        url: '',
        course: null,
        branch: null,
        semester: null,
        subject: null
    };

    // ═══════════════════════════════════════════════════════════════════════
    // HELPER FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════
    
    function getBaseUrl() {
        return window.location.origin + window.location.pathname;
    }

    function encodeShareParams(params) {
        var parts = [];
        for (var key in params) {
            if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
                parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
            }
        }
        return parts.join('&');
    }

    function generateShareUrl() {
        var params = {
            type: ShareData.type,
            id: ShareData.id
        };
        
        // Add navigation context
        if (AppState && AppState.selectedCourse) {
            params.course = AppState.selectedCourse.ID || AppState.selectedCourse.id || AppState.selectedCourse.Name;
        }
        if (AppState && AppState.selectedBranch) {
            params.branch = AppState.selectedBranch.ID || AppState.selectedBranch.id || AppState.selectedBranch.Name;
        }
        if (AppState && AppState.selectedSemester) {
            params.sem = AppState.selectedSemester.ID || AppState.selectedSemester.id || AppState.selectedSemester.Number;
        }
        if (AppState && AppState.selectedSubject) {
            params.subject = AppState.selectedSubject.ID || AppState.selectedSubject.id || AppState.selectedSubject.Name;
        }
        
        // Add highlight flag
        params.highlight = 'true';
        
        return getBaseUrl() + '#/share?' + encodeShareParams(params);
    }

    function getShareText() {
        var text = '';
        
        if (ShareData.title) {
            text = '📚 ' + ShareData.title;
        }
        
        if (ShareData.description) {
            text += '\n\n' + ShareData.description;
        }
        
        text += '\n\n🔗 Check it out: ';
        
        return text;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // OPEN SHARE MODAL
    // ═══════════════════════════════════════════════════════════════════════
    
    /**
     * Open share modal for a resource
     * @param {Object} options - Share options
     * @param {string} options.type - Type: 'resource', 'course', 'subject', etc.
     * @param {string} options.id - Resource/item ID
     * @param {string} options.title - Title to display
     * @param {string} options.description - Description text
     * @param {string} options.image - Thumbnail URL (optional)
     * @param {string} options.resourceType - PDF, Video, Notes, etc. (optional)
     */
    window.openSmartShareModal = function(options) {
        options = options || {};
        
        // Set share data
        ShareData.type = options.type || 'page';
        ShareData.id = options.id || null;
        ShareData.title = options.title || document.title || 'StudyHub Resource';
        ShareData.description = options.description || 'Check out this awesome learning resource!';
        ShareData.image = options.image || '';
        
        // Generate URL
        ShareData.url = generateShareUrl();
        
        // Update preview
        updateSharePreview(options);
        
        // Update share link input
        var shareLinkInput = document.getElementById('shareLink');
        if (shareLinkInput) {
            shareLinkInput.value = ShareData.url;
        }
        
        // Show modal
        var modal = document.getElementById('shareModal');
        if (modal) {
            modal.classList.add('active');
            modal.style.display = 'flex';
        }
        
        // Show/hide native share button based on support
        var nativeBtn = document.getElementById('nativeShareBtn');
        if (nativeBtn) {
            nativeBtn.style.display = navigator.share ? 'flex' : 'none';
        }
        
        console.log('📤 Share modal opened:', ShareData);
    };

    function updateSharePreview(options) {
        var previewImage = document.getElementById('sharePreviewImage');
        var previewTitle = document.getElementById('sharePreviewTitle');
        var previewDesc = document.getElementById('sharePreviewDesc');
        var previewType = document.getElementById('sharePreviewType');
        
        if (previewTitle) {
            previewTitle.textContent = options.title || 'Resource';
        }
        
        if (previewDesc) {
            previewDesc.textContent = options.description || 'Check out this resource!';
        }
        
        if (previewType) {
            previewType.textContent = options.resourceType || options.type || 'Resource';
        }
        
        if (previewImage) {
            if (options.image) {
                previewImage.innerHTML = '<img src="' + options.image + '" alt="' + (options.title || '') + '">';
            } else {
                // Show icon based on type
                var icons = {
                    'pdf': 'fa-file-pdf',
                    'video': 'fa-video',
                    'notes': 'fa-sticky-note',
                    'course': 'fa-graduation-cap',
                    'subject': 'fa-book',
                    'resource': 'fa-file-alt'
                };
                var iconClass = icons[options.resourceType?.toLowerCase()] || icons[options.type] || 'fa-share-alt';
                previewImage.innerHTML = '<i class="fas ' + iconClass + '"></i>';
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // CLOSE SHARE MODAL
    // ═══════════════════════════════════════════════════════════════════════
    
    window.closeShareModal = function() {
        var modal = document.getElementById('shareModal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(function() {
                modal.style.display = 'none';
            }, 300);
        }
        
        // Reset copy button
        var copyBtn = document.getElementById('copyLinkBtn');
        if (copyBtn) {
            copyBtn.classList.remove('copied');
            copyBtn.innerHTML = '<i class="fas fa-copy"></i><span>Copy</span>';
        }
    };

    // ═══════════════════════════════════════════════════════════════════════
    // SOCIAL SHARE FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════
    
    window.shareToWhatsApp = function() {
        var text = getShareText() + ShareData.url;
        var url = 'https://api.whatsapp.com/send?text=' + encodeURIComponent(text);
        window.open(url, '_blank', 'width=600,height=600');
        showShareToast('Opening WhatsApp...');
    };

    window.shareToTwitter = function() {
        var text = '📚 ' + ShareData.title;
        var url = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(text) + '&url=' + encodeURIComponent(ShareData.url);
        window.open(url, '_blank', 'width=600,height=400');
        showShareToast('Opening Twitter...');
    };

    window.shareToFacebook = function() {
        var url = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(ShareData.url) + '&quote=' + encodeURIComponent(ShareData.title);
        window.open(url, '_blank', 'width=600,height=400');
        showShareToast('Opening Facebook...');
    };

    window.shareToLinkedIn = function() {
        var url = 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(ShareData.url);
        window.open(url, '_blank', 'width=600,height=400');
        showShareToast('Opening LinkedIn...');
    };

    window.shareToTelegram = function() {
        var text = getShareText() + ShareData.url;
        var url = 'https://t.me/share/url?url=' + encodeURIComponent(ShareData.url) + '&text=' + encodeURIComponent('📚 ' + ShareData.title);
        window.open(url, '_blank', 'width=600,height=600');
        showShareToast('Opening Telegram...');
    };

    window.shareViaEmail = function() {
        var subject = '📚 ' + ShareData.title + ' - StudyHub';
        var body = getShareText() + ShareData.url;
        var url = 'mailto:?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
        window.location.href = url;
        showShareToast('Opening email client...');
    };

    window.copyShareLink = function() {
        var shareLinkInput = document.getElementById('shareLink');
        var copyBtn = document.getElementById('copyLinkBtn');
        
        if (!shareLinkInput) return;
        
        // Copy to clipboard
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(shareLinkInput.value).then(function() {
                onCopySuccess();
            }).catch(function() {
                fallbackCopy();
            });
        } else {
            fallbackCopy();
        }
        
        function fallbackCopy() {
            shareLinkInput.select();
            try {
                document.execCommand('copy');
                onCopySuccess();
            } catch (e) {
                showShareToast('Failed to copy', 'error');
            }
        }
        
        function onCopySuccess() {
            if (copyBtn) {
                copyBtn.classList.add('copied');
                copyBtn.innerHTML = '<i class="fas fa-check"></i><span>Copied!</span>';
            }
            showShareToast('Link copied to clipboard!');
            
            setTimeout(function() {
                if (copyBtn) {
                    copyBtn.classList.remove('copied');
                    copyBtn.innerHTML = '<i class="fas fa-copy"></i><span>Copy</span>';
                }
            }, 2000);
        }
    };

    window.triggerNativeShare = function() {
        if (!navigator.share) {
            showShareToast('Native sharing not supported', 'warning');
            return;
        }
        
        navigator.share({
            title: ShareData.title,
            text: ShareData.description,
            url: ShareData.url
        }).then(function() {
            showShareToast('Shared successfully!');
            closeShareModal();
        }).catch(function(err) {
            if (err.name !== 'AbortError') {
                console.error('Share failed:', err);
            }
        });
    };

    // ═══════════════════════════════════════════════════════════════════════
    // TOAST NOTIFICATION
    // ═══════════════════════════════════════════════════════════════════════
    
    function showShareToast(message, type) {
        var toast = document.getElementById('shareToast');
        var toastMessage = document.getElementById('shareToastMessage');
        
        if (!toast) {
            // Create toast if not exists
            toast = document.createElement('div');
            toast.className = 'share-toast';
            toast.id = 'shareToast';
            toast.innerHTML = '<i class="fas fa-check-circle"></i><span id="shareToastMessage"></span>';
            document.body.appendChild(toast);
            toastMessage = toast.querySelector('#shareToastMessage');
        }
        
        // Update icon based on type
        var icon = toast.querySelector('i');
        if (icon) {
            icon.className = 'fas ';
            if (type === 'error') {
                icon.className += 'fa-times-circle';
                icon.style.color = '#ef4444';
            } else if (type === 'warning') {
                icon.className += 'fa-exclamation-circle';
                icon.style.color = '#f59e0b';
            } else {
                icon.className += 'fa-check-circle';
                icon.style.color = '#10b981';
            }
        }
        
        if (toastMessage) {
            toastMessage.textContent = message;
        }
        
        toast.classList.add('show');
        
        setTimeout(function() {
            toast.classList.remove('show');
        }, 2500);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // HELPER: SHARE RESOURCE FROM CARD
    // ═══════════════════════════════════════════════════════════════════════
    
    /**
     * Quick share function for resource cards
     * Use this in your .share-btn click handler
     */
    window.shareResource = function(id, type, title, description, image) {
        openSmartShareModal({
            type: 'resource',
            id: id,
            title: title || 'Resource',
            description: description || 'Check out this study resource!',
            image: image || '',
            resourceType: type || 'PDF'
        });
    };

    /**
     * Share current course/branch/semester/subject view
     */
    window.shareCurrentView = function() {
        var type = 'page';
        var id = null;
        var title = 'StudyHub';
        var description = 'Free study resources';
        
        if (typeof AppState !== 'undefined') {
            if (AppState.selectedSubject) {
                type = 'subject';
                id = AppState.selectedSubject.ID || AppState.selectedSubject.id;
                title = AppState.selectedSubject.Name || AppState.selectedSubject.name || 'Subject';
                description = 'Study materials for ' + title;
            } else if (AppState.selectedSemester) {
                type = 'semester';
                id = AppState.selectedSemester.ID || AppState.selectedSemester.id;
                title = 'Semester ' + (AppState.selectedSemester.Number || AppState.selectedSemester.number || '');
                description = 'All subjects for ' + title;
            } else if (AppState.selectedBranch) {
                type = 'branch';
                id = AppState.selectedBranch.ID || AppState.selectedBranch.id;
                title = AppState.selectedBranch.Name || AppState.selectedBranch.name || 'Branch';
                description = 'Semesters and subjects for ' + title;
            } else if (AppState.selectedCourse) {
                type = 'course';
                id = AppState.selectedCourse.ID || AppState.selectedCourse.id;
                title = AppState.selectedCourse.Name || AppState.selectedCourse.name || 'Course';
                description = 'All branches for ' + title;
            }
        }
        
        openSmartShareModal({
            type: type,
            id: id,
            title: title,
            description: description
        });
    };

    // ═══════════════════════════════════════════════════════════════════════
    // DEEP LINK PARSER - REDIRECT TO SHARED CONTENT
    // ═══════════════════════════════════════════════════════════════════════
    
    function parseDeepShareLink() {
        var hash = window.location.hash;
        
        // Check if it's a share link
        if (hash.indexOf('#/share?') === -1) return false;
        
        var queryPart = hash.split('?')[1];
        if (!queryPart) return false;
        
        var params = new URLSearchParams(queryPart);
        var type = params.get('type');
        var id = params.get('id');
        var courseId = params.get('course');
        var branchId = params.get('branch');
        var semId = params.get('sem');
        var subjectId = params.get('subject');
        var highlight = params.get('highlight') === 'true';
        
        console.log('🔗 Deep share link detected:', { type, id, courseId, branchId, semId, subjectId, highlight });
        
        // Wait for data to load, then navigate
        var attempts = 0;
        var maxAttempts = 20;
        
        var checkAndNavigate = function() {
            attempts++;
            
            // Check if AppState has data
            var hasData = typeof AppState !== 'undefined' && 
                         AppState.courses && 
                         AppState.courses.length > 0;
            
            if (!hasData && attempts < maxAttempts) {
                setTimeout(checkAndNavigate, 250);
                return;
            }
            
            // Navigate based on type
            navigateToSharedContent(type, id, courseId, branchId, semId, subjectId, highlight);
        };
        
        setTimeout(checkAndNavigate, 500);
        
        return true;
    }

    function navigateToSharedContent(type, id, courseId, branchId, semId, subjectId, highlight) {
        console.log('🧭 Navigating to shared content...');
        
        try {
            // Step 1: Navigate to course
            if (courseId && typeof selectCourse === 'function') {
                var course = findItemById(AppState.courses, courseId);
                if (course) {
                    selectCourse(course);
                }
            }
            
            // Step 2: Navigate to branch
            if (branchId && typeof selectBranch === 'function') {
                setTimeout(function() {
                    var branch = findItemById(AppState.branches, branchId);
                    if (branch) {
                        selectBranch(branch);
                    }
                }, 300);
            }
            
            // Step 3: Navigate to semester
            if (semId && typeof selectSemester === 'function') {
                setTimeout(function() {
                    var semester = findItemById(AppState.semesters, semId);
                    if (semester) {
                        selectSemester(semester);
                    }
                }, 600);
            }
            
            // Step 4: Navigate to subject
            if (subjectId && typeof selectSubject === 'function') {
                setTimeout(function() {
                    var subject = findItemById(AppState.subjects, subjectId);
                    if (subject) {
                        selectSubject(subject);
                    }
                }, 900);
            }
            
            // Step 5: Highlight the shared item
            if (highlight && id) {
                setTimeout(function() {
                    highlightSharedItem(type, id);
                }, 1200);
            }
            
            // Clean up URL
            setTimeout(function() {
                history.replaceState(null, '', window.location.pathname);
            }, 2000);
            
        } catch (e) {
            console.error('Navigation error:', e);
        }
    }

    function findItemById(array, id) {
        if (!array || !id) return null;
        
        var idStr = String(id).toLowerCase();
        
        for (var i = 0; i < array.length; i++) {
            var item = array[i];
            var itemId = String(item.ID || item.id || item.Name || item.name || '').toLowerCase();
            if (itemId === idStr) {
                return item;
            }
        }
        
        return null;
    }

    function highlightSharedItem(type, id) {
        // Find the card
        var card = document.querySelector('.resource-card[data-id="' + id + '"]');
        
        if (!card) {
            // Try other selectors
            card = document.querySelector('[data-id="' + id + '"]');
        }
        
        if (!card) {
            // Try finding by title or other attributes
            card = document.querySelector('.resource-card');
        }
        
        if (card) {
            // Scroll into view
            card.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
            
            // Add highlight class
            card.classList.add('share-highlight');
            
            // Remove after animation
            setTimeout(function() {
                card.classList.remove('share-highlight');
            }, 3000);
            
            console.log('✨ Highlighted shared item');
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // INTEGRATION WITH YOUR RESOURCE CARDS
    // ═══════════════════════════════════════════════════════════════════════
    
    /**
     * Hook into your existing share button clicks
     * Find your bindResourceCardEvents and update the share handler
     */
    function setupResourceCardSharing() {
        // Use event delegation for dynamically created cards
        document.addEventListener('click', function(e) {
            // Check if clicked element is a share button
            var shareBtn = e.target.closest('.share-btn, .resource-icon-btn.share-btn, [data-action="share"]');
            
            if (shareBtn) {
                e.preventDefault();
                e.stopPropagation();
                
                var card = shareBtn.closest('.resource-card');
                if (!card) return;
                
                var id = shareBtn.dataset.id || card.dataset.id;
                var type = shareBtn.dataset.type || 'pdf';
                var title = shareBtn.dataset.title || card.querySelector('.resource-title')?.textContent || 'Resource';
                var thumbnail = card.querySelector('.resource-thumbnail img')?.src || '';
                
                // Get description from card if available
                var desc = card.querySelector('.resource-meta')?.textContent || 
                          'Check out this study resource on StudyHub!';
                
                shareResource(id, type, title, desc, thumbnail);
            }
        });
        
        console.log('✅ Resource card sharing initialized');
    }

    // ═══════════════════════════════════════════════════════════════════════
    // INITIALIZE
    // ═══════════════════════════════════════════════════════════════════════
    
    function initSmartSharing() {
        // Parse deep link
        parseDeepShareLink();
        
        // Listen for hash changes
        window.addEventListener('hashchange', parseDeepShareLink);
        
        // Setup card sharing
        setupResourceCardSharing();
        
        // Close modal on escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeShareModal();
            }
        });
        
        console.log('📤 Smart Sharing System initialized!');
    }

    // Run on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSmartSharing);
    } else {
        initSmartSharing();
    }

    // Also export for manual use
    window.ShareData = ShareData;

    console.log('════════════════════════════════════════════════════════════');
    console.log('📤 SMART SHARING SYSTEM LOADED');
    console.log('════════════════════════════════════════════════════════════');
    console.log('');
    console.log('Usage:');
    console.log('  shareResource(id, type, title, description, image)');
    console.log('  shareCurrentView()');
    console.log('  openSmartShareModal({ type, id, title, description, image })');
    console.log('');
    console.log('════════════════════════════════════════════════════════════');

})();
