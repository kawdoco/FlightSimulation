package com.flightsimulation.serial;
import java.io.*;
/** Bounded newline framing. An oversized frame is discarded through its newline. */
final class SerialLineReader {
 private final Reader reader;private final int limit;
 SerialLineReader(Reader reader,int limit){if(limit<1)throw new IllegalArgumentException("Invalid limit");this.reader=reader;this.limit=limit;}
 String readLine() throws IOException {
  StringBuilder line=new StringBuilder();boolean oversized=false;
  while(true){int ch=reader.read();
   if(ch==-1){if(oversized)throw new FrameTooLongException();return line.isEmpty()?null:line.toString();}
   if(ch=='\n'){if(oversized)throw new FrameTooLongException();if(!line.isEmpty()&&line.charAt(line.length()-1)=='\r')line.setLength(line.length()-1);return line.toString();}
   if(line.length()<limit)line.append((char)ch);else oversized=true;
  }
 }
 static final class FrameTooLongException extends IOException {}
}
