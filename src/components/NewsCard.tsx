
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExternalLink, Clock, Languages, RotateCcw } from "lucide-react";
import { translateText, SUPPORTED_LANGUAGES } from '@/utils/translationService';
import { toast } from "@/hooks/use-toast";

interface NewsItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
  guid: string;
}

interface NewsCardProps {
  article: NewsItem;
  getSourceColor: (source: string) => string;
  formatDate: (dateString: string) => string;
}

const NewsCard: React.FC<NewsCardProps> = ({ article, getSourceColor, formatDate }) => {
  const [translatedTitle, setTranslatedTitle] = useState<string>('');
  const [translatedDescription, setTranslatedDescription] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [isTranslated, setIsTranslated] = useState(false);

  const handleTranslate = async (languageCode: string) => {
    if (!languageCode) return;
    
    setIsTranslating(true);
    try {
      const [titleResult, descriptionResult] = await Promise.all([
        translateText(article.title, languageCode),
        translateText(article.description, languageCode)
      ]);
      
      setTranslatedTitle(titleResult.translatedText);
      setTranslatedDescription(descriptionResult.translatedText);
      setIsTranslated(true);
      
      toast({
        title: "Translation Complete",
        description: `Article translated to ${SUPPORTED_LANGUAGES.find(lang => lang.code === languageCode)?.name}`,
      });
    } catch (error) {
      toast({
        title: "Translation Failed",
        description: "Could not translate the article. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const resetTranslation = () => {
    setTranslatedTitle('');
    setTranslatedDescription('');
    setIsTranslated(false);
    setSelectedLanguage('');
  };

  return (
    <Card 
      className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:scale-105 cursor-pointer group"
      onClick={() => window.open(article.link, '_blank')}
    >
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Badge className={`${getSourceColor(article.source)} text-white border-0`}>
            {article.source}
          </Badge>
          <ExternalLink className="h-4 w-4 text-white/60 group-hover:text-white transition-colors" />
        </div>
        <CardTitle className="text-white text-lg leading-tight line-clamp-2 group-hover:text-purple-200 transition-colors">
          {isTranslated && translatedTitle ? translatedTitle : article.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-white/70 text-sm mb-4 line-clamp-3">
          {isTranslated && translatedDescription ? translatedDescription : article.description}
        </p>
        
        {/* Translation Controls */}
        <div className="mb-4 space-y-2" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-2">
            <Languages className="h-4 w-4 text-white/60" />
            <span className="text-xs text-white/60">Translate</span>
          </div>
          <div className="flex items-center gap-2">
            <Select 
              value={selectedLanguage} 
              onValueChange={(value) => {
                setSelectedLanguage(value);
                handleTranslate(value);
              }}
              disabled={isTranslating}
            >
              <SelectTrigger className="w-full bg-white/10 border-white/20 text-white text-xs">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {isTranslated && (
              <Button
                variant="outline"
                size="sm"
                onClick={resetTranslation}
                className="border-white/20 text-white/70 hover:bg-white/10 px-2"
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
            )}
          </div>
          
          {isTranslating && (
            <div className="text-xs text-white/60 flex items-center gap-1">
              <div className="animate-spin h-3 w-3 border border-white/30 border-t-white/70 rounded-full"></div>
              Translating...
            </div>
          )}
        </div>

        <div className="flex items-center text-xs text-white/50">
          <Clock className="h-3 w-3 mr-1" />
          {formatDate(article.pubDate)}
        </div>
      </CardContent>
    </Card>
  );
};

export default NewsCard;
