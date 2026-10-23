package com.flightsimulation.serial;
import java.io.StringReader;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
class SerialLineReaderTest {
 @Test void readsCrLfAndEof()throws Exception{var r=new SerialLineReader(new StringReader("abc\r\nlast"),10);assertEquals("abc",r.readLine());assertEquals("last",r.readLine());assertNull(r.readLine());}
 @Test void discardsOversizedFrameAndResumes()throws Exception{var r=new SerialLineReader(new StringReader("123456789\nok\n"),4);assertThrows(SerialLineReader.FrameTooLongException.class,r::readLine);assertEquals("ok",r.readLine());}
 @Test void acceptsExactLimit()throws Exception{var r=new SerialLineReader(new StringReader("1234\n"),4);assertEquals("1234",r.readLine());}
 @Test void rejectsOversizedUnterminatedInput()throws Exception{var r=new SerialLineReader(new StringReader("123456789"),4);assertThrows(SerialLineReader.FrameTooLongException.class,r::readLine);assertNull(r.readLine());}
}
