// В обработчике handleSubmit:
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!isAgreed) {
    alert('Необходимо согласиться с политикой конфиденциальности');
    return;
  }
  
  setIsSubmitting(true);
  
  try {
    await sendToTelegram(formData);
    
    setIsModalOpen(false);
    // Передаем информацию о том, откуда пришли
    navigate('/thanks', { 
      state: { 
        from: '/',
        section: 'header' 
      } 
    });
    
    setFormData({ name: '', phone: '' });
    setIsAgreed(false);
    
  } catch (error) {
    console.error('Ошибка отправки:', error);
    alert('❌ Ошибка отправки. Попробуйте позже или позвоните нам напрямую.');
  } finally {
    setIsSubmitting(false);
  }
};
