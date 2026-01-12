// Create Hackathon Form Component
function CreateHackathonForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
    const [loading, setLoading] = useState(false);
    const [uploadingBanner, setUploadingBanner] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [formData, setFormData] = useState({
      title: '',
      description: '',
      category: 'WEB_DEVELOPMENT',
      registrationStart: '',
      registrationEnd: '',
      startDate: '',
      endDate: '',
      submissionDeadline: '',
      prizeAmount: '',
      prizeCurrency: 'USD',
      registrationFee: '',
      requirements: { description: '', technologies: [], deliverables: [] },
      rules: '',
      guidelines: '',
      bannerImageUrl: '',
      logoImageUrl: '',
      minTeamSize: 1,
      maxTeamSize: 5,
      allowIndividual: true,
    });
  
    const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image size must be less than 10MB');
        return;
      }
      
      setUploadingBanner(true);
      try {
        toast.loading('Uploading banner image...', { id: 'banner-upload' });
        const result = await api.uploadFile(file, 'hackathons/banners');
        setFormData({ ...formData, bannerImageUrl: result.file.url });
        toast.success('Banner image uploaded successfully!', { id: 'banner-upload' });
      } catch (error: any) {
        toast.error(`Failed to upload banner: ${error.message}`, { id: 'banner-upload' });
        console.error('Banner upload error:', error);
      } finally {
        setUploadingBanner(false);
      }
    };
    
    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Logo size must be less than 5MB');
        return;
      }
      
      setUploadingLogo(true);
      try {
        toast.loading('Uploading logo...', { id: 'logo-upload' });
        const result = await api.uploadFile(file, 'hackathons/logos');
        setFormData({ ...formData, logoImageUrl: result.file.url });
        toast.success('Logo uploaded successfully!', { id: 'logo-upload' });
      } catch (error: any) {
        toast.error(`Failed to upload logo: ${error.message}`, { id: 'logo-upload' });
        console.error('Logo upload error:', error);
      } finally {
        setUploadingLogo(false);
      }
    };
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
  
      try {
        // Verify user role before creating
        const currentUser = await api.getCurrentUser();
        if (currentUser.role !== 'ORGANIZER' && currentUser.role !== 'ADMIN') {
          toast.error('You need ORGANIZER role to create hackathons. Please update your role in Profile Settings.');
          setLoading(false);
          return;
        }
  
        // Convert datetime-local to ISO string format
        const formatDate = (dateString: string) => {
          if (!dateString) return '';
          // datetime-local format is YYYY-MM-DDTHH:mm, convert to ISO
          return new Date(dateString).toISOString();
        };
  
        const hackathonData = {
          ...formData,
          registrationStart: formatDate(formData.registrationStart),
          registrationEnd: formatDate(formData.registrationEnd),
          startDate: formatDate(formData.startDate),
          endDate: formatDate(formData.endDate),
          submissionDeadline: formatDate(formData.submissionDeadline),
          prizeAmount: formData.prizeAmount ? parseFloat(formData.prizeAmount) : undefined,
          registrationFee: formData.registrationFee ? parseFloat(formData.registrationFee) : undefined,
          minTeamSize: formData.minTeamSize || 1,
          maxTeamSize: formData.maxTeamSize || 5,
        };
  
        await api.createHackathon(hackathonData);
        toast.success('Hackathon created successfully! You can publish it from the dashboard.');
        onSuccess();
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to create hackathon';
        if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
          toast.error('You need ORGANIZER role to create hackathons. Please update your role in Profile Settings.');
        } else {
          toast.error(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="title" className="text-white font-semibold">Hackathon Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., AI Innovation Challenge 2024"
              className="mt-2 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
              required
            />
          </div>
          <div>
            <Label htmlFor="category" className="text-white font-semibold">Category *</Label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="mt-2 w-full bg-slate-800/50 border border-slate-600 rounded-md px-3 py-2 text-white focus:border-blue-400 focus:outline-none"
              required
            >
              <option value="WEB_DEVELOPMENT">Web Development</option>
              <option value="MOBILE_DEVELOPMENT">Mobile Development</option>
              <option value="AI_ML">AI/ML</option>
              <option value="DATA_SCIENCE">Data Science</option>
              <option value="CYBERSECURITY">Cybersecurity</option>
              <option value="GAME_DEVELOPMENT">Game Development</option>
              <option value="BLOCKCHAIN">Blockchain</option>
              <option value="IOT">IoT</option>
              <option value="OPEN_INNOVATION">Open Innovation</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>
        <div>
          <Label htmlFor="description" className="text-white font-semibold">Description *</Label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            placeholder="Describe your hackathon, goals, and what participants will build..."
            className="mt-2 w-full bg-slate-800/50 border border-slate-600 rounded-md px-3 py-2 text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none"
            required
          />
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <Label htmlFor="registrationStart" className="text-white font-semibold">Registration Start *</Label>
            <Input
              id="registrationStart"
              type="datetime-local"
              value={formData.registrationStart}
              onChange={(e) => setFormData({ ...formData, registrationStart: e.target.value })}
              className="mt-2 bg-slate-800/50 border-slate-600 text-white"
              required
            />
          </div>
          <div>
            <Label htmlFor="registrationEnd" className="text-white font-semibold">Registration End *</Label>
            <Input
              id="registrationEnd"
              type="datetime-local"
              value={formData.registrationEnd}
              onChange={(e) => setFormData({ ...formData, registrationEnd: e.target.value })}
              className="mt-2 bg-slate-800/50 border-slate-600 text-white"
              required
            />
          </div>
          <div>
            <Label htmlFor="startDate" className="text-white font-semibold">Start Date *</Label>
            <Input
              id="startDate"
              type="datetime-local"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="mt-2 bg-slate-800/50 border-slate-600 text-white"
              required
            />
          </div>
          <div>
            <Label htmlFor="endDate" className="text-white font-semibold">End Date *</Label>
            <Input
              id="endDate"
              type="datetime-local"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="mt-2 bg-slate-800/50 border-slate-600 text-white"
              required
            />
          </div>
          <div>
            <Label htmlFor="submissionDeadline" className="text-white font-semibold">Submission Deadline *</Label>
            <Input
              id="submissionDeadline"
              type="datetime-local"
              value={formData.submissionDeadline}
              onChange={(e) => setFormData({ ...formData, submissionDeadline: e.target.value })}
              className="mt-2 bg-slate-800/50 border-slate-600 text-white"
              required
            />
          </div>
          <div>
            <Label htmlFor="prizeAmount" className="text-white font-semibold">Prize Amount</Label>
            <Input
              id="prizeAmount"
              type="number"
              value={formData.prizeAmount}
              onChange={(e) => setFormData({ ...formData, prizeAmount: e.target.value })}
              placeholder="e.g., 50000"
              className="mt-2 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
            />
          </div>
          <div>
            <Label htmlFor="registrationFee" className="text-white font-semibold">Registration Fee</Label>
            <Input
              id="registrationFee"
              type="number"
              min="0"
              step="0.01"
              value={formData.registrationFee}
              onChange={(e) => setFormData({ ...formData, registrationFee: e.target.value })}
              placeholder="e.g., 10.00"
              className="mt-2 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="rules" className="text-white font-semibold">Rules *</Label>
          <textarea
            id="rules"
            value={formData.rules}
            onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
            rows={3}
            placeholder="List key rules and guidelines..."
            className="mt-2 w-full bg-slate-800/50 border border-slate-600 rounded-md px-3 py-2 text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none"
            required
          />
        </div>
        <div>
          <Label htmlFor="guidelines" className="text-white font-semibold">Guidelines *</Label>
          <textarea
            id="guidelines"
            value={formData.guidelines}
            onChange={(e) => setFormData({ ...formData, guidelines: e.target.value })}
            rows={3}
            placeholder="Provide guidelines for participants..."
            className="mt-2 w-full bg-slate-800/50 border border-slate-600 rounded-md px-3 py-2 text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none"
            required
          />
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="bannerImage" className="text-white font-semibold">Banner Image</Label>
            <div className="mt-2 space-y-2">
              <div className="flex gap-2">
                <label
                  htmlFor="bannerImage"
                  className="flex-1 cursor-pointer"
                >
                  <div className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800/50 border-2 border-dashed border-slate-600 rounded-md hover:border-blue-500 transition-colors">
                    {uploadingBanner ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                        <span className="text-white text-sm">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-blue-400" />
                        <span className="text-white text-sm">Upload Banner Image</span>
                      </>
                    )}
                  </div>
                  <input
                    id="bannerImage"
                    type="file"
                    accept="image/*"
                    onChange={handleBannerUpload}
                    className="hidden"
                    disabled={uploadingBanner}
                  />
                </label>
              </div>
              {formData.bannerImageUrl && (
                <div className="mt-2">
                  <img 
                    src={formData.bannerImageUrl} 
                    alt="Banner preview" 
                    className="w-full h-32 object-cover rounded-md border border-slate-600"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <Button
                    type="button"
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold"
                    size="sm"
                    onClick={() => setFormData({ ...formData, bannerImageUrl: '' })}
                    className="mt-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 w-full"
                  >
                    Remove Banner
                  </Button>
                </div>
              )}
              <p className="text-xs text-white">Or enter URL below</p>
              <Input
                id="bannerImageUrl"
                type="url"
                value={formData.bannerImageUrl}
                onChange={(e) => setFormData({ ...formData, bannerImageUrl: e.target.value })}
                placeholder="https://example.com/banner.jpg"
                className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="logoImage" className="text-white font-semibold">Logo Image</Label>
            <div className="mt-2 space-y-2">
              <div className="flex gap-2">
                <label
                  htmlFor="logoImage"
                  className="flex-1 cursor-pointer"
                >
                  <div className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800/50 border-2 border-dashed border-slate-600 rounded-md hover:border-blue-500 transition-colors">
                    {uploadingLogo ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                        <span className="text-white text-sm">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-blue-400" />
                        <span className="text-white text-sm">Upload Logo</span>
                      </>
                    )}
                  </div>
                  <input
                    id="logoImage"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    disabled={uploadingLogo}
                  />
                </label>
              </div>
              {formData.logoImageUrl && (
                <div className="mt-2">
                  <img 
                    src={formData.logoImageUrl} 
                    alt="Logo preview" 
                    className="w-24 h-24 object-contain rounded-md border border-slate-600"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <Button
                    type="button"
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold"
                    size="sm"
                    onClick={() => setFormData({ ...formData, logoImageUrl: '' })}
                    className="mt-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 w-full"
                  >
                    Remove Logo
                  </Button>
                </div>
              )}
              <p className="text-xs text-white">Or enter URL below</p>
              <Input
                id="logoImageUrl"
                type="url"
                value={formData.logoImageUrl}
                onChange={(e) => setFormData({ ...formData, logoImageUrl: e.target.value })}
                placeholder="https://example.com/logo.png"
                className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <Button 
            type="submit" 
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Create Hackathon
              </>
            )}
          </Button>
          <Button
            type="button"
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-semibold"
            className="border-2 border-slate-600 hover:bg-slate-800 text-white"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </form>
    );
  }
  