import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

const Index = () => {
  const [activeSection, setActiveSection] = useState<'home' | 'generator'>('home');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('60');
  const [resolution, setResolution] = useState('1920x1080');
  const [format, setFormat] = useState('mp4');
  const [isGenerating, setIsGenerating] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const savedState = localStorage.getItem('videoGeneration');
    if (savedState) {
      const { isGenerating: savedIsGenerating, estimatedTime: savedEstimatedTime, endTime } = JSON.parse(savedState);
      if (savedIsGenerating && endTime) {
        const now = Date.now();
        const remainingMs = endTime - now;
        if (remainingMs > 0) {
          setIsGenerating(true);
          setEstimatedTime(savedEstimatedTime);
          setRemainingTime(Math.ceil(remainingMs / 1000));
          toast({
            title: 'Генерация продолжается',
            description: 'Ваше видео всё ещё создаётся',
          });
        } else {
          localStorage.removeItem('videoGeneration');
          toast({
            title: 'Видео готово!',
            description: 'Ваше видео было создано, пока вас не было',
          });
        }
      }
    }
  }, [toast]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating && remainingTime > 0) {
      interval = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            setIsGenerating(false);
            localStorage.removeItem('videoGeneration');
            toast({
              title: 'Видео готово!',
              description: 'Ваше видео успешно создано и готово к скачиванию',
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isGenerating, remainingTime, toast]);

  useEffect(() => {
    if (isGenerating && remainingTime > 0) {
      const endTime = Date.now() + remainingTime * 1000;
      localStorage.setItem('videoGeneration', JSON.stringify({
        isGenerating: true,
        estimatedTime,
        remainingTime,
        endTime
      }));
    }
  }, [isGenerating, remainingTime, estimatedTime]);

  const calculateEstimatedTime = (videoDuration: string, videoResolution: string) => {
    const durationSeconds = parseInt(videoDuration);
    const baseTime = durationSeconds * 2;
    
    let multiplier = 1;
    if (videoResolution === '1920x1080') multiplier = 1.5;
    if (videoResolution === '3840x2160') multiplier = 2.5;
    
    return Math.round(baseTime * multiplier);
  };

  const handleGenerate = () => {
    if (!description.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите описание видео',
        variant: 'destructive',
      });
      return;
    }

    const estimated = calculateEstimatedTime(duration, resolution);
    const endTime = Date.now() + estimated * 1000;
    setEstimatedTime(estimated);
    setRemainingTime(estimated);
    setIsGenerating(true);
    
    localStorage.setItem('videoGeneration', JSON.stringify({
      isGenerating: true,
      estimatedTime: estimated,
      remainingTime: estimated,
      endTime
    }));
    
    toast({
      title: 'Генерация началась!',
      description: `Примерное время: ${Math.floor(estimated / 60)}м ${estimated % 60}с`,
    });
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20" />
      
      <div className="absolute top-20 left-10 w-96 h-96 bg-primary/30 rounded-full blur-[120px] animate-glow" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/30 rounded-full blur-[120px] animate-glow" style={{ animationDelay: '1s' }} />

      <nav className="relative z-10 border-b border-border/50 glass">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center neon-glow">
              <Icon name="Play" size={24} className="text-background" />
            </div>
            <h1 className="text-2xl font-heading font-bold neon-text">VideoAI</h1>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={activeSection === 'home' ? 'default' : 'ghost'}
              onClick={() => setActiveSection('home')}
              className="font-heading"
            >
              <Icon name="Home" size={18} className="mr-2" />
              Главная
            </Button>
            <Button
              variant={activeSection === 'generator' ? 'default' : 'ghost'}
              onClick={() => setActiveSection('generator')}
              className="font-heading"
            >
              <Icon name="Sparkles" size={18} className="mr-2" />
              Генератор
            </Button>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        {activeSection === 'home' && (
          <div className="container mx-auto px-6 py-20">
            <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
              <h2 className="text-6xl md:text-7xl font-heading font-bold leading-tight">
                Создавайте видео
                <br />
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent neon-text">
                  силой ИИ
                </span>
              </h2>
              
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Превратите текстовое описание в профессиональное видео за минуты.
                От 30 секунд до 5 минут в высоком качестве.
              </p>

              <div className="flex gap-4 justify-center pt-6">
                <Button
                  size="lg"
                  className="font-heading text-lg neon-glow hover:scale-105 transition-transform"
                  onClick={() => setActiveSection('generator')}
                >
                  <Icon name="Sparkles" size={20} className="mr-2" />
                  Начать создание
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="font-heading text-lg glass border-primary/50 hover:scale-105 transition-transform"
                >
                  <Icon name="PlayCircle" size={20} className="mr-2" />
                  Посмотреть примеры
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-24 animate-slide-up">
              <Card className="p-6 glass border-primary/30 hover:border-primary/60 transition-all hover:scale-105">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4 neon-glow">
                  <Icon name="Zap" size={24} className="text-primary" />
                </div>
                <h3 className="text-xl font-heading font-semibold mb-2">Быстрая генерация</h3>
                <p className="text-muted-foreground">
                  Создавайте видео за минуты, а не часы. Современные алгоритмы ИИ работают молниеносно.
                </p>
              </Card>

              <Card className="p-6 glass border-secondary/30 hover:border-secondary/60 transition-all hover:scale-105">
                <div className="w-12 h-12 rounded-lg bg-secondary/20 flex items-center justify-center mb-4 neon-glow">
                  <Icon name="Monitor" size={24} className="text-secondary" />
                </div>
                <h3 className="text-xl font-heading font-semibold mb-2">Высокое качество</h3>
                <p className="text-muted-foreground">
                  HD, Full HD и 4K разрешения. Выберите качество, которое нужно вашему проекту.
                </p>
              </Card>

              <Card className="p-6 glass border-accent/30 hover:border-accent/60 transition-all hover:scale-105">
                <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4 neon-glow">
                  <Icon name="Settings" size={24} className="text-accent" />
                </div>
                <h3 className="text-xl font-heading font-semibold mb-2">Гибкие настройки</h3>
                <p className="text-muted-foreground">
                  Выбирайте длительность, разрешение и формат экспорта под ваши нужды.
                </p>
              </Card>
            </div>
          </div>
        )}

        {activeSection === 'generator' && (
          <div className="container mx-auto px-6 py-20">
            <div className="max-w-3xl mx-auto animate-fade-in">
              <div className="text-center mb-12">
                <h2 className="text-5xl font-heading font-bold mb-4 neon-text">
                  Генератор видео
                </h2>
                <p className="text-muted-foreground text-lg">
                  Опишите, что вы хотите увидеть, и мы создадим видео для вас
                </p>
              </div>

              <Card className="p-8 glass border-primary/30">
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="description" className="text-base font-heading mb-2 block">
                      Описание видео
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Например: Космический корабль летит сквозь звёзды, камера медленно приближается к планете Земля..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={5}
                      className="resize-none glass border-primary/30 focus:border-primary"
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      Чем детальнее описание, тем лучше результат
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="duration" className="text-base font-heading mb-2 block">
                        Длительность
                      </Label>
                      <Select value={duration} onValueChange={setDuration}>
                        <SelectTrigger className="glass border-primary/30">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 секунд</SelectItem>
                          <SelectItem value="60">1 минута</SelectItem>
                          <SelectItem value="120">2 минуты</SelectItem>
                          <SelectItem value="180">3 минуты</SelectItem>
                          <SelectItem value="240">4 минуты</SelectItem>
                          <SelectItem value="300">5 минут</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="resolution" className="text-base font-heading mb-2 block">
                        Разрешение
                      </Label>
                      <Select value={resolution} onValueChange={setResolution}>
                        <SelectTrigger className="glass border-primary/30">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1280x720">HD (720p)</SelectItem>
                          <SelectItem value="1920x1080">Full HD (1080p)</SelectItem>
                          <SelectItem value="3840x2160">4K (2160p)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="format" className="text-base font-heading mb-2 block">
                        Формат
                      </Label>
                      <Select value={format} onValueChange={setFormat}>
                        <SelectTrigger className="glass border-primary/30">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mp4">MP4</SelectItem>
                          <SelectItem value="mov">MOV</SelectItem>
                          <SelectItem value="webm">WebM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {isGenerating && (
                    <Card className="p-6 glass border-primary/50 bg-primary/5">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Icon name="Loader2" size={24} className="text-primary animate-spin" />
                            <div>
                              <h4 className="font-heading font-semibold text-lg">Создаём видео</h4>
                              <p className="text-sm text-muted-foreground">
                                Осталось времени: {Math.floor(remainingTime / 60)}м {remainingTime % 60}с
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-heading font-bold text-primary">
                              {Math.round((1 - remainingTime / estimatedTime) * 100)}%
                            </div>
                          </div>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-primary via-secondary to-accent transition-all duration-1000 ease-linear"
                            style={{ width: `${(1 - remainingTime / estimatedTime) * 100}%` }}
                          />
                        </div>
                      </div>
                    </Card>
                  )}

                  <div className="pt-4">
                    <Button
                      size="lg"
                      className="w-full font-heading text-lg neon-glow hover:scale-[1.02] transition-transform"
                      onClick={handleGenerate}
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <>
                          <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                          Создаём видео...
                        </>
                      ) : (
                        <>
                          <Icon name="Sparkles" size={20} className="mr-2" />
                          Создать видео
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>

              <div className="mt-8 grid md:grid-cols-2 gap-4">
                <Card className="p-4 glass border-border/50">
                  <div className="flex items-start gap-3">
                    <Icon name="Clock" size={20} className="text-primary mt-1" />
                    <div>
                      <h4 className="font-heading font-semibold mb-1">Время генерации</h4>
                      <p className="text-sm text-muted-foreground">
                        Обычно занимает 2-5 минут в зависимости от длительности
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 glass border-border/50">
                  <div className="flex items-start gap-3">
                    <Icon name="Download" size={20} className="text-secondary mt-1" />
                    <div>
                      <h4 className="font-heading font-semibold mb-1">Скачивание</h4>
                      <p className="text-sm text-muted-foreground">
                        Готовое видео будет доступно для скачивания в выбранном формате
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;