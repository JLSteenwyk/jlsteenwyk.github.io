# load necessary packages
library(scholar)
library(ggplot2)
library(extrafont)

# get citation information from the past 10 years
cit<-get_citation_history('VXV2j6gAAAAJ&hl')
cit<-head(cit,10)

# generate citations figure
png('/Users/jacoblsteenwyk/Desktop/GITHUB/GITHUB_WEBSITE/images/scholar_citations_JLSteenwyk.png',width=1500,height=500,res=500)

ggplot(cit,aes(x=year,y=cites))+
  geom_bar(stat='identity')+
  theme_classic()+
  xlab('Year')+
  ylab('Citations')+
  annotate('text',label=format(Sys.time(), "%Y-%m-%d %H:%M:%S %Z\nData from Google Scholar"),x=-Inf,y=Inf,vjust=1,hjust=-0.05,size=2,colour='gray', family="Times New Roman")+
  theme(axis.title.x=element_text(vjust=-1, size=8, family="Times New Roman"),axis.title.y=element_text(vjust=1.5, size=8, family="Times New Roman"),legend.text=element_text(size=6, family="Times New Roman"), legend.title=element_blank(),axis.text.x=element_text(size=6, family="Times New Roman"),axis.text.y=element_text(size=6, family="Times New Roman"))

dev.off()
