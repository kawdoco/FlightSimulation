package com.flightsimulation.config;
import org.springframework.context.annotation.*;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.web.servlet.config.annotation.*;
@Configuration
public class AsyncWebConfig implements WebMvcConfigurer {
 @Bean public ThreadPoolTaskExecutor streamingExecutor(){
  var executor=new ThreadPoolTaskExecutor();
  executor.setCorePoolSize(2);executor.setMaxPoolSize(8);executor.setQueueCapacity(32);
  executor.setThreadNamePrefix("http-stream-");
  executor.setTaskDecorator(new RequestContextTaskDecorator());
  executor.setWaitForTasksToCompleteOnShutdown(false);
  return executor;
 }
 @Override public void configureAsyncSupport(AsyncSupportConfigurer configurer){
  configurer.setTaskExecutor(streamingExecutor());configurer.setDefaultTimeout(240000);
 }
}
