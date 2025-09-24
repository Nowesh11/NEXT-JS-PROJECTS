import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  TextField,
  FormControlLabel,
  Switch,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Slider,
  Grid
} from '@mui/material';
import AdminLayout from '../../../components/layouts/AdminLayout';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`slideshow-settings-tabpanel-${index}`}
      aria-labelledby={`slideshow-settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function SlideshowSettings() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  const [formData, setFormData] = useState({
    general: {
      defaultInterval: 5000,
      defaultAutoPlay: true,
      defaultShowControls: true,
      defaultShowIndicators: true,
      maxSlidesPerShow: 10
    },
    animations: {
      enabled: true,
      defaultAnimation: 'fade',
      defaultDuration: 500
    },
    permissions: {
      allowPublicSubmissions: false,
      requireApproval: true,
      allowedRoles: ['admin', 'editor']
    }
  });

  // 检查用户是否已登录
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/signin');
    }
  }, [status, router]);

  // 加载幻灯片设置
  useEffect(() => {
    if (session) {
      fetchSettings();
    }
  }, [session]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/slideshow-settings');
      if (response.data.success && response.data.data) {
        setFormData(response.data.data);
      }
    } catch (error) {
      console.error('获取幻灯片设置失败:', error);
      setSnackbar({
        open: true,
        message: '获取幻灯片设置失败',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleGeneralChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      general: {
        ...formData.general,
        [name]: type === 'checkbox' ? checked : value
      }
    });
  };

  const handleSliderChange = (name, section) => (event, newValue) => {
    setFormData({
      ...formData,
      [section]: {
        ...formData[section],
        [name]: newValue
      }
    });
  };

  const handleAnimationsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      animations: {
        ...formData.animations,
        [name]: type === 'checkbox' ? checked : value
      }
    });
  };

  const handlePermissionsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      permissions: {
        ...formData.permissions,
        [name]: type === 'checkbox' ? checked : value
      }
    });
  };

  const handleRolesChange = (event) => {
    const {
      target: { value },
    } = event;
    setFormData({
      ...formData,
      permissions: {
        ...formData.permissions,
        allowedRoles: typeof value === 'string' ? value.split(',') : value,
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const response = await axios.put('/api/slideshow-settings', formData);
      if (response.data.success) {
        setSnackbar({
          open: true,
          message: '幻灯片设置已保存',
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('保存幻灯片设置失败:', error);
      setSnackbar({
        open: true,
        message: '保存幻灯片设置失败',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (status === 'loading' || loading) {
    return (
      <AdminLayout>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <CircularProgress />
          </Box>
        </Container>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            幻灯片设置
          </Typography>
          <Typography variant="body1" color="text.secondary">
            配置幻灯片的默认行为和权限设置
          </Typography>
        </Box>

        <Paper sx={{ width: '100%', mb: 2 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="slideshow settings tabs">
              <Tab label="常规设置" id="slideshow-settings-tab-0" />
              <Tab label="动画设置" id="slideshow-settings-tab-1" />
              <Tab label="权限设置" id="slideshow-settings-tab-2" />
            </Tabs>
          </Box>

          <form onSubmit={handleSubmit}>
            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    默认间隔时间 (毫秒)
                  </Typography>
                  <Slider
                    value={formData.general.defaultInterval}
                    onChange={handleSliderChange('defaultInterval', 'general')}
                    aria-labelledby="default-interval-slider"
                    valueLabelDisplay="auto"
                    step={500}
                    marks
                    min={1000}
                    max={10000}
                  />
                  <TextField
                    margin="normal"
                    fullWidth
                    id="defaultInterval"
                    name="defaultInterval"
                    label="默认间隔时间 (毫秒)"
                    type="number"
                    value={formData.general.defaultInterval}
                    onChange={handleGeneralChange}
                    inputProps={{ min: 1000, max: 30000 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    最大幻灯片数量
                  </Typography>
                  <Slider
                    value={formData.general.maxSlidesPerShow}
                    onChange={handleSliderChange('maxSlidesPerShow', 'general')}
                    aria-labelledby="max-slides-slider"
                    valueLabelDisplay="auto"
                    step={1}
                    marks
                    min={1}
                    max={50}
                  />
                  <TextField
                    margin="normal"
                    fullWidth
                    id="maxSlidesPerShow"
                    name="maxSlidesPerShow"
                    label="每个幻灯片最大数量"
                    type="number"
                    value={formData.general.maxSlidesPerShow}
                    onChange={handleGeneralChange}
                    inputProps={{ min: 1, max: 50 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.general.defaultAutoPlay}
                        onChange={handleGeneralChange}
                        name="defaultAutoPlay"
                        color="primary"
                      />
                    }
                    label="默认自动播放"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.general.defaultShowControls}
                        onChange={handleGeneralChange}
                        name="defaultShowControls"
                        color="primary"
                      />
                    }
                    label="默认显示控制按钮"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.general.defaultShowIndicators}
                        onChange={handleGeneralChange}
                        name="defaultShowIndicators"
                        color="primary"
                      />
                    }
                    label="默认显示指示器"
                  />
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.animations.enabled}
                        onChange={handleAnimationsChange}
                        name="enabled"
                        color="primary"
                      />
                    }
                    label="启用动画"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="default-animation-label">默认动画效果</InputLabel>
                    <Select
                      labelId="default-animation-label"
                      id="defaultAnimation"
                      name="defaultAnimation"
                      value={formData.animations.defaultAnimation}
                      onChange={handleAnimationsChange}
                      label="默认动画效果"
                      disabled={!formData.animations.enabled}
                    >
                      <MenuItem value="fade">淡入淡出</MenuItem>
                      <MenuItem value="slide">滑动</MenuItem>
                      <MenuItem value="zoom">缩放</MenuItem>
                      <MenuItem value="none">无动画</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    默认动画持续时间 (毫秒)
                  </Typography>
                  <Slider
                    value={formData.animations.defaultDuration}
                    onChange={handleSliderChange('defaultDuration', 'animations')}
                    aria-labelledby="default-duration-slider"
                    valueLabelDisplay="auto"
                    step={100}
                    marks
                    min={100}
                    max={2000}
                    disabled={!formData.animations.enabled}
                  />
                  <TextField
                    margin="normal"
                    fullWidth
                    id="defaultDuration"
                    name="defaultDuration"
                    label="默认动画持续时间 (毫秒)"
                    type="number"
                    value={formData.animations.defaultDuration}
                    onChange={handleAnimationsChange}
                    inputProps={{ min: 100, max: 2000 }}
                    disabled={!formData.animations.enabled}
                  />
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.permissions.allowPublicSubmissions}
                        onChange={handlePermissionsChange}
                        name="allowPublicSubmissions"
                        color="primary"
                      />
                    }
                    label="允许公开提交幻灯片"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.permissions.requireApproval}
                        onChange={handlePermissionsChange}
                        name="requireApproval"
                        color="primary"
                      />
                    }
                    label="需要审核后才能发布"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="allowed-roles-label">允许管理幻灯片的角色</InputLabel>
                    <Select
                      labelId="allowed-roles-label"
                      id="allowedRoles"
                      multiple
                      value={formData.permissions.allowedRoles}
                      onChange={handleRolesChange}
                      input={<OutlinedInput id="select-multiple-chip" label="允许管理幻灯片的角色" />}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip key={value} label={value} />
                          ))}
                        </Box>
                      )}
                    >
                      <MenuItem value="admin">管理员</MenuItem>
                      <MenuItem value="editor">编辑</MenuItem>
                      <MenuItem value="author">作者</MenuItem>
                      <MenuItem value="contributor">贡献者</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </TabPanel>

            <Box sx={{ p: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                disabled={saving}
                startIcon={saving && <CircularProgress size={20} />}
              >
                {saving ? '保存中...' : '保存设置'}
              </Button>
            </Box>
          </form>
        </Paper>

        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </AdminLayout>
  );
}